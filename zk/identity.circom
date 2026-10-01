pragma circom 2.0.0;

template DemoIdentity() {
    signal input secret;
    signal input challenge;
    signal input scope;

    signal output nullifier;
    signal output commitment;

    // A simple algebraic commitment (since we aren't including Poseidon to keep it small)
    // commitment = secret^2 + scope
    // nullifier = secret * scope
    // challenge is bound by ensuring a dummy variable = challenge^2
    
    signal s_squared;
    s_squared <== secret * secret;
    commitment <== s_squared + scope;

    nullifier <== secret * scope;

    signal c_squared;
    c_squared <== challenge * challenge;
}

component main { public [challenge, scope] } = DemoIdentity();
