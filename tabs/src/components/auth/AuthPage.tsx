import {Providers, TeamsProvider} from "@microsoft/mgt";
import {FC, useEffect} from "react"
import {TeamsMsal2Provider} from "@microsoft/mgt";

const AuthPage : FC = () => {


    useEffect(() => {
        TeamsMsal2Provider.handleAuth()
        let provider = Providers.globalProvider;
        console.log(`Provider State: ${provider.state}`)
    }, []);


    return(
        <>
        </>
    )
}

export default AuthPage