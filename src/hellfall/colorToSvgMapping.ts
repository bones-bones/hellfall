import R from '../assets/R.svg';
import W from '../assets/W.svg';
import U from '../assets/U.svg';
import G from '../assets/G.svg';
import B from '../assets/B.svg';
import T from '../assets/T.svg';
import C from '../assets/C.svg';
import Zero from '../assets/0.svg';
import One from '../assets/1.svg';
import Two from '../assets/2.svg';
import Three from '../assets/3.svg';
import Four from '../assets/4.svg';
import Five from '../assets/5.svg';
import Six from '../assets/6.svg';
import Seven from '../assets/7.svg';
import Eight from '../assets/8.svg';
import Ecks from '../assets/X.svg';
import WB from '../assets/WB.svg';
import BG from '../assets/BG.svg';
import BR from '../assets/BR.svg';
import UB from '../assets/UB.svg';
import UR from '../assets/UR.svg';
import GU from '../assets/GU.svg';
import WU from '../assets/WU.svg';
import GW from '../assets/GW.svg';
import RG from '../assets/RG.svg';
import RW from '../assets/RW.svg';
import TwoW from '../assets/2W.svg';
import TwoB from '../assets/2B.svg';
import TwoU from '../assets/2U.svg';
import TwoR from '../assets/2R.svg';
import TwoG from '../assets/2G.svg';
import P from '../assets/P.png';
import Y from '../assets/Y.png';
import GP from '../assets/GP.svg';
import WP from '../assets/WP.svg';
import UP from '../assets/UP.svg';
import BP from '../assets/BP.svg';
import RP from '../assets/RP.svg';
import S from '../assets/S.svg';

export const colorToSvgMapping = (value: string) => {
  switch (value) {
    case 'R': {
      return R;
    }
    case 'W': {
      return W;
    }
    case 'U': {
      return U;
    }
    case 'G': {
      return G;
    }
    case 'B': {
      return B;
    }
    case 'T': {
      return T;
    }
    case 'C': {
      return C;
    }
    case '0': {
      return Zero;
    }
    case '1': {
      return One;
    }
    case '2': {
      return Two;
    }
    case '3': {
      return Three;
    }
    case '4': {
      return Four;
    }
    case '5': {
      return Five;
    }
    case '6': {
      return Six;
    }
    case '7': {
      return Seven;
    }
    case 'X': {
      return Ecks;
    }
    case 'W/B': {
      return WB;
    }
    case 'B/G': {
      return BG;
    }
    case 'B/R': {
      return BR;
    }
    case 'U/B': {
      return UB;
    }
    case 'U/R': {
      return UR;
    }
    case 'G/U': {
      return GU;
    }
    case 'W/U': {
      return WU;
    }
    case 'G/W': {
      return GW;
    }
    case 'R/G': {
      return RG;
    }
    case 'R/W': {
      return RW;
    }
    case '8': {
      return Eight;
    }
    case '2/W': {
      return TwoW;
    }
    case '2/U': {
      return TwoU;
    }
    case '2/R': {
      return TwoR;
    }
    case '2/G': {
      return TwoG;
    }
    case '2/B': {
      return TwoB;
    }
    case 'P': {
      return P;
    }
    case 'Y': {
      return Y;
    }
    case 'H/G':
    case 'Pickle': {
      return GP;
    }
    case 'H/R': {
      return RP;
    }
    case 'H/W': {
      return WP;
    }
    case 'H/B': {
      return BP;
    }
    case 'H/U': {
      return UP;
    }
    case 'S': {
      return S;
    }
  }
};

//{B/W}{B/G}{B/R}",
