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
import MatrixTileDrop from "./MatrixTileDrop";
import FractionGame from "./FractionGame";
import CoordinatesLesson from "./CoordinatesGame";
import CoordinatePairsLesson from "./CoordinatePairsLesson";
import AxesLesson from "./AxesLesson";
import XAndYCoordinatesLesson from "./XAndYCoordinatesLesson";
import PlottingPointsLesson from "./PlottingPointsLesson";
import IdentifyingPointsLesson from "./IdentifyingPointsLesson";
import AppliedCoordinatesLesson from "./AppliedCoordinatesLesson";
import CoordinateRevesion from "./CoordinateRevesion";
import CoordinatePlaneLevel from "./CoordinatePlaneLevel";


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
        <Route path="/MatrixTile-Drop" element={<MatrixTileDrop/>} />

        <Route path="/new-game" element={<FractionGame/>} />

        <Route path="/Coordinates-Lesson" element={<CoordinatesLesson/>} />
        <Route path="/pair-Lesson" element={<CoordinatePairsLesson/>} />
        <Route path="/axes-Lesson" element={<AxesLesson/>} />
        <Route path="/xys-Lesson" element={<XAndYCoordinatesLesson/>} />
        <Route path="/ploting-Lesson" element={<PlottingPointsLesson/>} />
        <Route path="/Identifying-Lesson" element={<IdentifyingPointsLesson/>} />
        <Route path="/Applied-Lesson" element={<AppliedCoordinatesLesson/>} />
        <Route path="/Applied-revesion" element={<CoordinateRevesion/>} />
        <Route path="/panelco" element={<CoordinatePlaneLevel/>} />

      </Routes>
    </BrowserRouter>
  );
}
