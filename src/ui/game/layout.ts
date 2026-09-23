import type { PassengerType } from '../../game/types';
import { figureAspect } from './PassengerFigure';

/** Pixel geometry of the tower, derived once per size change and shared by view and effects. */
export interface TowerLayout {
  width: number;
  height: number;
  floorCount: number;
  rowHeight: number;
  labelWidth: number;
  shaftX: number;
  shaftWidth: number;
  cabinWidth: number;
  cabinHeight: number;
  lobbyX: number;
  lobbyWidth: number;
  figureHeight: number;
  badgeSize: number;
  slotWidth: number;
}

export function computeTowerLayout(width: number, height: number, floorCount: number): TowerLayout {
  const rowHeight = height / floorCount;
  const labelWidth = 46;
  const shaftWidth = Math.round(Math.min(136, Math.max(84, rowHeight * 1.9)));
  const lobbyX = labelWidth + shaftWidth + 10;
  const lobbyWidth = Math.max(0, width - lobbyX - 8);
  const badgeSize = Math.round(Math.min(24, Math.max(15, rowHeight * 0.34)));
  const naturalFigure = Math.min(40, rowHeight - badgeSize - 2);
  const naturalSlot = Math.max(naturalFigure * figureAspect('group'), badgeSize + 10) + 4;
  const fit = Math.min(1, lobbyWidth / (naturalSlot * 4));
  return {
    width,
    height,
    floorCount,
    rowHeight,
    labelWidth,
    shaftX: labelWidth,
    shaftWidth,
    cabinWidth: shaftWidth - 10,
    cabinHeight: rowHeight - 6,
    lobbyX,
    lobbyWidth,
    figureHeight: naturalFigure * fit,
    badgeSize: Math.round(badgeSize * Math.max(0.8, fit)),
    slotWidth: naturalSlot * fit,
  };
}

/** Top of a floor row; floor 0 is at the bottom of the screen. */
export function floorTop(layout: TowerLayout, floor: number): number {
  return (layout.floorCount - 1 - floor) * layout.rowHeight;
}

export function queueSlotX(layout: TowerLayout, index: number): number {
  return layout.lobbyX + index * layout.slotWidth;
}

export function figureWidth(layout: TowerLayout, type: PassengerType): number {
  return layout.figureHeight * figureAspect(type);
}
