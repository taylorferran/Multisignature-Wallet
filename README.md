# Purpose

It’s an opportunity to prove you can build well designed and scalable backend architectures. We also want to gauge your knowledge of the Ethereum blockchain. The assessment is based on real work you’d be doing if you joined Openfort.

## The assessment

- Design and implement a secure multi-sig wallet contract:
- Define the number of signatories required to execute a transaction (e.g. 2 out of 3).
- Define the list of signatories and their addresses.
- Implement the functionality to add/remove signatures.
- Implement the functionality to execute a transaction after the required number of signatures have been obtained.
- Implement the functionality to cancel a transaction before it has been executed.

Extra points for:

- Implementing a way to recover the wallet in case of loss of private keys.
- Support for WebAuthn (FIDO2) as a second factor of authentication for signing transactions.
- Access control for actions that can be taken by signatories (e.g. add/remove signatories, execute/cancel transactions).

## Stack

Deployment in any EVM based blockchain (e.g. Ethereum, Binance Smart Chain, Polygon, etc) is fine.

## Taylor's notes

I think I covered every point except support for WebAuthn, although it uses a SHA256 hashing algorithm.
This is the same way I've implemented the wallet recovery functionality, so I believe it wouldn't be a big stretch to extend this for WebAuthn support!

For deployment I just created a version which includes 3 test wallets I own. The idea for production would be to use the factory contract to produce as many as we want at scale. 

Deployed and verified here on Goerli:
https://goerli.etherscan.io/address/0xB124A9ed0a4f451712c11ae8285667Af76a16341#code

Functionality includes:
- Defining signatories, signatory roles and inital amount of signatures required. Done on contract creation.
- Create transactions if a signatory. Inserting the deposit address and deposit amount.
- Sign transactions if a signatory.
- Unsign transactions if a signatory.
- If transaction signatures reaches 0, transaction is sent out to the deposit address.
- Cancel transactions if the address calling it is signatory level two or below.
- Update number of signatures needed if the address calling it is signatory level one.
- Add a signatory if the address calling it is signatory level one.
- Remove a signatory if the address calling it is signatory level one.
- Assign a password hash to an address.
- Sign a transaction using the password for that address (for recovery purposes).

Main functionality unit tested, would need expanded for edge cases:
  Openfort Multisignature wallet contract tests
    ✔ Create a transaction as a signatory (1104ms)
    ✔ Can't create a transaction if not a signatory (52ms)
    ✔ Can sign a transaction if a signatory and transaction processes (78ms)
    ✔ Can unsign a transaction (67ms)
    ✔ Can cancel a transaction only if level 2 or above (52ms)
    ✔ Change number of signers if account level 1 (38ms)
    ✔ Add a signatory (41ms)
    ✔ Remove a signatory
  8 passing (1s)