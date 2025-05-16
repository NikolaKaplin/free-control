import {Finger, FingerCurl, FingerDirection, GestureDescription} from "fingerpose";


export const PalmUp = new GestureDescription('palm_up');

// Загнутость пальцев
PalmUp.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.8);
PalmUp.addCurl(Finger.Index, FingerCurl.NoCurl, 0.8);
PalmUp.addCurl(Finger.Middle, FingerCurl.NoCurl, 0.8);
PalmUp.addCurl(Finger.Ring, FingerCurl.NoCurl, 0.8);
PalmUp.addCurl(Finger.Pinky, FingerCurl.NoCurl, 0.8);

// Направление
PalmUp.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.8);
PalmUp.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);
PalmUp.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.8);
PalmUp.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.7);

