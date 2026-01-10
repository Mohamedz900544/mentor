import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./app/Home";

import BalanceBeamLab from "./RandomGames/BalanceBeamLab";
import MirrorBounceLab from "./RandomGames/MirrorBounceLab";
import CircuitLoopGame from "./RandomGames/CircuitLoopGame";
import FractionSmashProduct from "./RandomGames/FractionSmashProduct";
import FractionSnakeGame from "./RandomGames/FractionSnakeGame";
import FractionGardenGame from "./RandomGames/FractionGardenGame";
import MatrixPortalQuest from "./RandomGames/MatrixPortalQuest";
import MatrixCandyMixer from "./RandomGames/MatrixCandyMixer";
import FarmMatrixAnimals from "./RandomGames/FarmMatrixAnimals";
import MatrixTileDrop from "./RandomGames/MatrixTileDrop";
import FractionGame from "./RandomGames/FractionGame";

import CoordinatesLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/CoordinatesGame";
import CoordinatePairsLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/CoordinatePairsLesson";
import AxesLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/AxesLesson";
import XAndYCoordinatesLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/XAndYCoordinatesLesson";
import PlottingPointsLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/PlottingPointsLesson";
import IdentifyingPointsLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/IdentifyingPointsLesson";
import AppliedCoordinatesLesson from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/AppliedCoordinatesLesson";
import CoordinateRevesion from "./Mathematics/Coordinate Plane/Level 1 Points & Pairs/CoordinateRevesion";

import CoordinatePlaneLevel from "./Mathematics/Coordinate Plane/CoordinatePlaneLevel";

import CurrentLoopsLesson from "./Physics & Engineering/Electrical Circuits/Level 1 Current & Circuits/CurrentLoopsLesson";
import ShortCircuitsLesson from "./Physics & Engineering/Electrical Circuits/Level 1 Current & Circuits/ShortCircuitsLesson";
import ChoosingBulbsLesson from "./Physics & Engineering/Electrical Circuits/Level 1 Current & Circuits/ChoosingBulbsLesson";
import SplittingCurrentLesson from "./Physics & Engineering/Electrical Circuits/Level 1 Current & Circuits/SplittingCurrentLesson";
import CircuitUnitMap from "./Physics & Engineering/Electrical Circuits/CircuitUnitMap";

import LearningPathsMain from "./LearningPathsMain";

import FindingHalfLesson1 from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/FindingHalfLessons1";
import CombiningPartsLesson from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/CombiningPartsLesson";
import SplittingPartsLesson from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/SplittingPartsLesson";
import SplittingAndCombiningLesson from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/SplittingAndCombiningLesson";
import EqualPartsGame from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/EqualPartsGame";
import MoreFractionColoringLesson from "./Mathematics/Arithmetic Thinking/Level 1  Visualize Fractions/MoreFractionColoringLesson";
import Panelfraction from "./Mathematics/Arithmetic Thinking/panelfraction";
import SixthsAndTwelfthsLesson from "./Mathematics/Arithmetic Thinking/Level 2  Equivalent Fractions/SixthsAndTwelfthsLesson";
import EighthsAndSixteenthsLesson from "./Mathematics/Arithmetic Thinking/Level 2  Equivalent Fractions/EighthsAndSixteenthsLesson";
import MakingEquivalentFractionsLesson from "./MakingEquivalentFractionsLesson";


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

        <Route path="/cyrrebr" element={<CurrentLoopsLesson/>} />
        <Route path="/ShortCircuits-Lesson" element={<ShortCircuitsLesson/>} />
        <Route path="/ChoosingBulbs-Lesson" element={<ChoosingBulbsLesson/>} />
        <Route path="/ss-Lesson" element={<SplittingCurrentLesson/>} />

        <Route path="/CircuitUnit-Map" element={<CircuitUnitMap/>} />

        <Route path="/LearningPaths-Main" element={<LearningPathsMain/>} />


        <Route path="/FindingHalfLesson-1" element={<FindingHalfLesson1/>} />
        <Route path="/CombiningPartsLesson-1" element={<CombiningPartsLesson/>} />
        <Route path="/SplittingPartsLesson-1" element={<SplittingPartsLesson/>} />
        <Route path="/SplittingAndCombiningLesson-1" element={<SplittingAndCombiningLesson/>} />
        <Route path="/EqualPartsGame-1" element={<EqualPartsGame/>} />
        <Route path="/MoreFractionColoringLesson-1" element={<MoreFractionColoringLesson/>} />

        <Route path="/panelfraction-1" element={<Panelfraction/>} />

        <Route path="/SixthsAndTwelfthsLesson-1" element={<SixthsAndTwelfthsLesson/>} />
        <Route path="/EighthsAndSixteenthsLesson-1" element={<EighthsAndSixteenthsLesson/>} />
        <Route path="/MakingEquivalentFractionsLesson-1" element={<MakingEquivalentFractionsLesson/>} />




        

      </Routes>
    </BrowserRouter>
  );
}
