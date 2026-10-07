import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EKaushalyaModule", (m) => {
  const token = m.contract("EKaushalya");

  return { token };
});
