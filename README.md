# Fairbid v1
You can see Fairbid UI demo below.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with fairbid_v1, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid Introduction](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd fairbid_v1/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.


# UI DEMO

![fairbid-finalDeal-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/313dfafe-661f-4db4-87e6-c50f55ae115f)
------
![fairbid-myAuctions-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/7d0af21f-cb80-4cff-9d98-753105a960be)
-----
![fairbid-newAuction-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/5c8b9ca1-6314-4cc1-958c-282e5a80b4d9)
------
![fairbid-liveAuctions-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/aa56f5c8-5514-4e56-8737-f0e6344e25f7)
-------
![fairbid-auctionDetails-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/94d3ec40-4115-4e76-bfe9-495ed2b1bbf3)
![fairbid-askAndQr-demo](https://github.com/mervanerenci/fairbid_v1/assets/101268022/cdbb25e4-1184-4368-b1cf-3277743f9f32)
-------

### Note on frontend environment variables
- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
