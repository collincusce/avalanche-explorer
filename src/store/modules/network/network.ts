import { Module } from "vuex";
import { IRootState } from "@/store/types";
import { INetworkState } from "@/store/modules/network/types";
import { avalanche } from "@/avalanche";
import Network from "@/js/Network";
import axios from "@/axios";

const DEFAULT_NETWORK_ID = parseInt(process.env.VUE_APP_DEFAULT_NETWORKID || "4");

// Mainnet
const networkName = process.env.VUE_APP_NETWORKNAME;
const explorerFEUrl = process.env.VUE_APP_EXPLORER_FE_URL || "";
const orteliusURL = process.env.VUE_APP_ORTELIUS_URL || "";
const avalancheJSProtocol = process.env.VUE_APP_AVALANCHE_JS_PROTOCOL || "";
const avalancheJSIP = process.env.VUE_APP_AVALANCHE_JS_IP || "";
const avalancheJSPort = parseInt(process.env.VUE_APP_AVALANCHE_JS_PORT || "80");
const avalancheJSNetworkID = parseInt(process.env.VUE_APP_AVALANCHE_JS_NETWORKID || "0");
const avalancheJSChainID = process.env.VUE_APP_AVALANCHE_JS_CHAINID || "X";

// Testnet
const networkName_test = process.env.VUE_APP_TEST_NETWORKNAME || "";
const explorerFEUrl_test = process.env.VUE_APP_TEST_EXPLORER_FE_URL || "";
const orteliusURL_test = process.env.VUE_APP_TEST_ORTELIUS_URL || "";
const avalancheJSProtocol_test = process.env.VUE_APP_TEST_AVALANCHE_JS_PROTOCOL || "";
const avalancheJSIP_test = process.env.VUE_APP_TEST_AVALANCHE_JS_IP || "";
const avalancheJSPort_test = parseInt(process.env.VUE_APP_TEST_AVALANCHE_JS_PORT || "80");
const avalancheJSNetworkID_test = parseInt(process.env.VUE_APP_TEST_AVALANCHE_JS_NETWORKID || "0");
const avalancheJSChainID_test = process.env.VUE_APP_TEST_AVALANCHE_JS_CHAINID || "";

const network_module: Module<INetworkState, IRootState> = {
    namespaced: true,
    state: {
        status: "disconnected", // disconnected | connecting | connected
        networks: [],
        selectedNetwork: null
    },
    mutations: {
        addNetwork(state, net: Network){
            state.networks.push(net);
        },
    },
    actions: {
        async init({state, commit, dispatch}) {
            let mainnet = new Network(
                `${networkName} Testnet`,
                `${avalancheJSProtocol}://${avalancheJSIP}:${avalancheJSPort}`,
                avalancheJSNetworkID, 
                avalancheJSChainID,
                orteliusURL,
                explorerFEUrl
            );
            let testnet = new Network(
                `${networkName_test} Testnet`,
                `${avalancheJSProtocol_test}://${avalancheJSIP_test}:${avalancheJSPort_test}`,
                avalancheJSNetworkID_test, 
                avalancheJSChainID_test,
                orteliusURL_test,
                explorerFEUrl_test
            );
            
            if (DEFAULT_NETWORK_ID === 0) {
                await commit("addNetwork", mainnet);
            }
            await commit("addNetwork", testnet);

            // initialize selected network
            try {
                let defaultNetwork = state.networks.find((network: Network) => network.networkId === DEFAULT_NETWORK_ID);
                let res = await dispatch("setNetwork", defaultNetwork);
                return true;
            } catch (e) {
                console.log(e);
                state.status = "disconnected";
            }
        },
        async setNetwork({state}, net: Network): Promise<boolean> { 
            // Query the network to get network id
            state.status = "connecting";
            avalanche.setAddress(net.ip, net.port, net.protocol);
            avalanche.setNetworkID(net.networkId);
            avalanche.XChain().refreshBlockchainID();

            state.selectedNetwork = net;
            axios.defaults.baseURL = net.explorerUrl;

            state.status = "connected";
            return true;
        },
    },
};

export default network_module;