use rustler::{Encoder, Env, NifResult, Term};
use rustler::types::binary::{Binary, OwnedBinary};
use serde::{Serialize, Deserialize};
use yrs::{Doc, Transact, Update, ReadTxn};
use yrs::updates::decoder::Decode;

#[derive(Serialize, Deserialize)]
struct Crdt {
    state: Vec<u8>,  // Store the document's serialized state as bytes
}

impl Crdt {
    fn new() -> Self {
        let doc = Doc::new();
        let state = doc.transact().encode_state_as_update_v1(&doc.transact().state_vector());
        Crdt { state }
    }

    fn from_bytes(bytes: &[u8]) -> Self {
        let doc = Doc::new();
        let update = Update::decode_v1(bytes).unwrap();
        doc.transact_mut().apply_update(update);
        let state = doc.transact().encode_state_as_update_v1(&doc.transact().state_vector());
        Crdt { state }
    }

    fn merge(&mut self, other: &Crdt) {
        let mut doc = Doc::new();
        let mut txn = doc.transact_mut();
        let update = Update::decode_v1(&self.state).unwrap();
        txn.apply_update(update);

        let other_update = Update::decode_v1(&other.state).unwrap();
        txn.apply_update(other_update);

        self.state = doc.transact().encode_state_as_update_v1(&doc.transact().state_vector());
    }

    fn to_bytes(&self) -> Vec<u8> {
        self.state.clone()
    }
}

#[rustler::nif]
fn merge_crdt<'a>(env: Env<'a>, existing_state: Binary<'a>, update: Binary<'a>) -> NifResult<Binary<'a>> {
    let existing_crdt = Crdt::from_bytes(existing_state.as_slice());
    let update_crdt = Crdt::from_bytes(update.as_slice());

    let mut new_state = existing_crdt;
    new_state.merge(&update_crdt);

    let encoded = new_state.to_bytes();
    let mut out_binary = OwnedBinary::new(encoded.len()).unwrap();
    out_binary.as_mut_slice().copy_from_slice(&encoded);
    
    Ok(out_binary.release(env))
}

// Export the NIFs
rustler::init!("Elixir.YsCrdt");
