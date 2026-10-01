$ErrorActionPreference = "Stop"
cd d:\code_space\kalasetu

# Compile circuit
.\circom.exe zk\identity.circom --r1cs --wasm --sym -o zk

# Use local npx for snarkjs (assuming it's installed or we can npx it)
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e="some random text"
npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
npx snarkjs groth16 setup zk\identity.r1cs pot12_final.ptau zk\identity_0000.zkey
npx snarkjs zkey contribute zk\identity_0000.zkey zk\identity_final.zkey --name="Second contribution" -v -e="Another random text"
npx snarkjs zkey export verificationkey zk\identity_final.zkey zk\verification_key.json

# Copy wasm and zkey to frontend public folder
mkdir -p frontend\public\zk
cp zk\identity_js\identity.wasm frontend\public\zk\
cp zk\identity_final.zkey frontend\public\zk\

# Copy verification key to backend
mkdir -p backend\src\config
cp zk\verification_key.json backend\src\config\
