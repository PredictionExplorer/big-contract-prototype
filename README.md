# Big Contract Prototype

This project prototypes how to split a big contract, which byte-code would be too big, into 2 contracts. If we initially have a big contract named `Game`, we can split it into 2 contracts, named `Game1` and `Game2`.

This project includes a Hardhat test.

`Game1` contains most of the business logic. `Game2` contains some of the business logic, whatever didn't fit in `Game1` and was easy to carve out of `Game1`. `Game1` contains the `fallback` method that forwards all unrecognized calls to `Game2` via `delegatecall`.

Both `Game1` and `Game2` inherit `GameBase`, which is an abstract contract that contains all storage variables. It also inherits `Ownable`.

The deployed `Game1` contains an ETH balance and all storage data used in the business logic. It also contains contract owner address and an `immutable` address of `Game2`.

The deployed `Game2` contains contract owner address and `Game1` address (not `immutable`). Other inherited storage variables are not used.

It's not required that both game contracts had the same owner address.

Both game contracts are selfdestructable. `Game1.destruct` is responsible for destructing them both.
