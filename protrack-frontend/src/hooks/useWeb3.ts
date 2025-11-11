import { useContext } from "react";
import { Web3Context } from "../contexts/web3ContextTypes";

export const useWeb3 = () => {
  return useContext(Web3Context);
};
