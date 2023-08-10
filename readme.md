# DEPLOY SPECIFIC FILE
truffle migrate --f {prefix number} --to {prefix number} --network baseTestnet
# VERIFY CONTRACT
truffle run verify {CONTRACT_NAME}@{CONTRACT_ADDRESS} --network {NETWORK_NAME_IN_TRUFFLE_CONFIG}

# SETUP CONTRACT 
truffle exec --network {NETWORK_NAME_IN_TRUFFLE_CONFIG} ./scripts/{filename}.js