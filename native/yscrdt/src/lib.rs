use rustler::{Env, NifResult};
use rustler::types::binary::{Binary, OwnedBinary};
use yrs::{Doc, Transact, Update, ReadTxn, StateVector};
use yrs::updates::decoder::Decode;

struct Crdt {
    doc: Doc,
}

impl Crdt {
    fn new() -> Self {
        let doc = Doc::new();
        doc.get_or_insert_map("features");
        Crdt { doc }
    }

    /**
     * Create a new Crdt from a byte array
     */
    fn from_bytes(bytes: &[u8]) -> Self {
        let doc = Doc::new();
        doc.get_or_insert_map("features");
        let update_result = Update::decode_v1(bytes);
        match update_result {
            Ok(update) => {
                let state_vector_before = doc.transact().state_vector();
                doc.transact().encode_state_as_update_v1(&state_vector_before);
                doc.transact_mut().apply_update(update);
            }
            Err(e) => {
                println!("Failed to decode update: {:?}", e);
            }
        }
        Crdt { doc }
    }

    /**
     * Serialize the Crdt to a byte array
     */
    fn to_bytes(&self) -> Vec<u8> {
        let txn = self.doc.transact();
        let serialized = txn.encode_state_as_update_v1(&StateVector::default());
        serialized
    }

    /**
     * Merge the state of another Crdt into this one
     */
    fn merge(&mut self, other: &Crdt) {
        let other_update = other.doc.transact().encode_state_as_update_v1(&self.doc.transact().state_vector());
        self.doc.transact_mut().apply_update(Update::decode_v1(&other_update).unwrap());
    }
}

/**
 * Create a new Yjs document, serialize it to bytes, and return the bytes
 */
#[rustler::nif]
fn new_doc<'a>(env: Env<'a>) -> NifResult<Binary<'a>> {
    let doc = Crdt::new();  // Create a new Yjs document
    let encoded = doc.to_bytes();  // Serialize the document to bytes
    let mut out_binary = OwnedBinary::new(encoded.len()).unwrap();
    out_binary.as_mut_slice().copy_from_slice(&encoded);
    Ok(out_binary.release(env))
}

/**
 * Merge an update into an existing Yjs document
 */
#[rustler::nif]
fn merge_crdt<'a>(env: Env<'a>, existing_state: Binary<'a>, update: Binary<'a>) -> NifResult<Binary<'a>> {
    let mut existing_crdt = Crdt::from_bytes(existing_state.as_slice());
    let update_crdt = Crdt::from_bytes(update.as_slice());
    existing_crdt.merge(&update_crdt);

    let encoded = existing_crdt.to_bytes();

    let mut out_binary = OwnedBinary::new(encoded.len()).unwrap();
    out_binary.as_mut_slice().copy_from_slice(&encoded);
    
    Ok(out_binary.release(env))
}

// Export the NIFs
rustler::init!("Elixir.YsCrdt");
