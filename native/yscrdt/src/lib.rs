use rustler::{Encoder, Env, NifResult, Term};
use rustler::types::binary::{Binary, OwnedBinary};
use yrs::{Doc, Transact, Update, ReadTxn, WriteTxn, Map, StateVector};
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

    fn from_bytes(bytes: &[u8]) -> Self {
        println!("from_bytes bytes: {:?}", bytes);

        let doc = Doc::new();
        let update_result = Update::decode_v1(bytes);

        match update_result {
            Ok(update) => {
                println!("Successfully decoded update: {:?}", update);

                let state_vector_before = doc.transact().state_vector();
            
                {
                    let mut txn = doc.transact_mut();
                    let map = txn.get_or_insert_map("features");  // Ensure the map exists        
                }
        
         
                // Inspect document state before applying update
                let before_update = doc.transact().encode_state_as_update_v1(&state_vector_before);
                println!("Document state before applying update: {:?}", before_update);
        

                doc.transact_mut().apply_update(update);

                // Inspect document state after applying update
                let after_update = doc.transact().encode_state_as_update_v1(&state_vector_before);
                println!("Document state after applying update: {:?}", after_update);
            }
            Err(e) => {
                println!("Failed to decode update: {:?}", e);
            }
        }

        Crdt { doc }
    }

    fn merge(&mut self, other: &Crdt) {
        let other_update = other.doc.transact().encode_state_as_update_v1(&self.doc.transact().state_vector());
        self.doc.transact_mut().apply_update(Update::decode_v1(&other_update).unwrap());
    }

    fn to_bytes(&self) -> Vec<u8> {
        let txn = self.doc.transact();
        let serialized = txn.encode_state_as_update_v1(&StateVector::default());
        println!("to_bytes Serialized document after initialization: {:?}", serialized);
        serialized
    }
}

#[rustler::nif]
fn new_doc<'a>(env: Env<'a>) -> NifResult<Binary<'a>> {
    let doc = Crdt::new();  // Create a new Yjs document
    let encoded = doc.to_bytes();  // Serialize the document to bytes

    println!("Serialized document: {:?}", encoded);  // Debug output

    let mut out_binary = OwnedBinary::new(encoded.len()).unwrap();
    out_binary.as_mut_slice().copy_from_slice(&encoded);

    Ok(out_binary.release(env))
}

#[rustler::nif]
fn merge_crdt<'a>(env: Env<'a>, existing_state: Binary<'a>, update: Binary<'a>) -> NifResult<Binary<'a>> {
    // println!("merge_crdt existing_state: {:?}", existing_state);
    // println!("merge_crdt update: {:?}", update);

    let mut existing_crdt = Crdt::from_bytes(existing_state.as_slice());
    let update_crdt = Crdt::from_bytes(update.as_slice());
    // println!("existing_crdt: {:?}", existing_crdt.to_bytes());
    // println!("update_crdt: {:?}", update_crdt.to_bytes());

    existing_crdt.merge(&update_crdt);

    let encoded = existing_crdt.to_bytes();
    println!("Merged document serialized state: {:?}", encoded);

    let mut out_binary = OwnedBinary::new(encoded.len()).unwrap();
    out_binary.as_mut_slice().copy_from_slice(&encoded);
    
    Ok(out_binary.release(env))
}

// Export the NIFs
rustler::init!("Elixir.YsCrdt");
