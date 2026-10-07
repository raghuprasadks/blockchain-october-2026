import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterWebModule", (m) => {
  const counter = m.contract("Counter");

  return { counter };
});
