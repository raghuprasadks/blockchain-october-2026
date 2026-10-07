import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MathsCalculatorModule", (m) => {

    const calculator = m.contract("MathsCalculator");

    return { calculator };
});
