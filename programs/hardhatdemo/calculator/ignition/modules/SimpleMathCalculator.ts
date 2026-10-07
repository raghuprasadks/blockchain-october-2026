import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleMathCalculatorModule", (m) => {
  const calculator = m.contract("SimpleMathCalculator");

  return { calculator };
});
