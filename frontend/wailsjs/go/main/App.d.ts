// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {profile} from '../models';
import {options} from '../models';

export function GetVersion():Promise<string>;

export function List():Promise<Array<profile.Profile>>;

export function LoadConfig():Promise<string>;

export function OnSecondInstanceLaunch(arg1:options.SecondInstanceData):Promise<void>;

export function Run(arg1:string,arg2:string,arg3:Array<string>):Promise<string>;

export function SaveConfig(arg1:string):Promise<void>;
