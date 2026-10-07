import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BCAResultsModule", (m) => {
  const bcaResults = m.contract("BCAResults");

  return { bcaResults };
});
