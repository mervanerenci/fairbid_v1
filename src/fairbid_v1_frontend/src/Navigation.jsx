import './Navigation.scss';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor} from "@dfinity/agent";
import { fairbid_v1_backend } from '../../declarations/fairbid_v1_backend';
// import { fairbid_v1_backend} from "../../declarations/fairbid_v1_backend";

function Navigation() {
    const [principal, setPrincipal] = useState(undefined);
    const [needLogin, setNeedLogin] = useState(true);
    
    let actor = fairbid_v1_backend;

    const authClientPromise = AuthClient.create();

    const signIn = async () => {
        const authClient = await authClientPromise;

        const internetIdentityUrl = import.meta.env.PROD
            ? undefined :
            `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

            await new Promise((resolve) => {
                authClient.login({
                    identityProvider: internetIdentityUrl,
                    onSuccess: () => resolve(undefined),
                });
            });

        const identity = authClient.getIdentity();
        // updateIdentity(identity);
        setNeedLogin(false);
    };

    async function login(event) {
        event.preventDefault();
        let authClient = await AuthClient.create();
        // start the login process and wait for it to finish
        await new Promise((resolve) => {
            authClient.login({
                identityProvider:
                    process.env.DFX_NETWORK === "ic"
                        ? "http://a4tbr-q4aaa-aaaaa-qaafq-cai.localhost:4943"
                        : `http://a4tbr-q4aaa-aaaaa-qaafq-cai.localhost:4943`,
                onSuccess: resolve,
            });
        });
        const identity = authClient.getIdentity();
        
        // const agent = new HttpAgent({ identity });
        // actor = createActor(process.env.CANISTER_ID_FAIRBID_V1_BACKEND, {
        //     agent,
        // });
        updateIdentity(identity);
        setNeedLogin(false);
        return false;
      };

    const signOut = async () => {
        const authClient = await authClientPromise;
        await authClient.logout();
        const identity = authClient.getIdentity();
        updateIdentity(identity);
        setNeedLogin(true);
    }

    const updateIdentity = (identity) => {
        setPrincipal(identity.getPrincipal());
        (Actor.agentOf(fairbid_v1_backend)).replaceIdentity(identity);
    }

    const setInitialIdentity = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            updateIdentity(identity);
            setNeedLogin(!await authClient.isAuthenticated());
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setInitialIdentity();
    }, []);

    return (
        <>
            <div className="menu">
                <div className="menu-item">
                    <Link to="/">List auctions</Link>
                </div>
                <div className="menu-item">
                    <Link to="/newAuction">New auction</Link>
                </div>
                {needLogin ?
                    <div className="menu-item-button" onClick={login}>
                        Sign in
                    </div>
                    :
                    <div className="menu-item-button" onClick={signOut}>
                        Sign Out
                    </div>
                }
            </div>
            {!needLogin &&
                <div className="principal">
                    Logged in as: {principal?.toString()}
                </div>
            }
        </>
    );
}

export default Navigation;
