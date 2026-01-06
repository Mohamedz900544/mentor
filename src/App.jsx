import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./app/Home";

import BalanceBeamLab from "./BalanceBeamLab";
import MirrorBounceLab from "./MirrorBounceLab";
import CircuitLoopGame from "./CircuitLoopGame";
import FractionSmashProduct from "./FractionSmashProduct";
import FractionSnakeGame from "./FractionSnakeGame";
import FractionGardenGame from "./FractionGardenGame";
import MatrixPortalQuest from "./MatrixPortalQuest";
import MatrixCandyMixer from "./MatrixCandyMixer";
import FarmMatrixAnimals from "./FarmMatrixAnimals";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/balance-beam" element={<BalanceBeamLab />} />
        <Route path="/mirror-bounce" element={<MirrorBounceLab />} />
        <Route path="/circuit-loop" element={<CircuitLoopGame />} />
        <Route path="/fraction-smash" element={<FractionSmashProduct />} />
        <Route path="/fraction-snake" element={<FractionSnakeGame />} />
        <Route path="/fraction-garden" element={<FractionGardenGame />} />
        <Route path="/matrix-garden" element={<MatrixPortalQuest />} />
        <Route path="/Matrix-Candy-Mixer" element={<MatrixCandyMixer />} />
        <Route path="/Farm-Matrix-Animals" element={<FarmMatrixAnimals />} />
      </Routes>
    </BrowserRouter>
  );
}
