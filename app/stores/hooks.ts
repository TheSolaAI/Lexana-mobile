import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from './rootStore';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';

export const useAppDispatch = () => useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
