import { Router, type IRouter } from "express";
import {
  GetMusicActivityResponse,
  GetMusicBotStatusResponse,
  GetMusicCommandsResponse,
} from "@workspace/api-zod";
import {
  getMusicActivity,
  getMusicBotStatus,
  getMusicCommands,
} from "../lib/music-bot";

const router: IRouter = Router();

router.get("/music/status", (_req, res) => {
  res.json(GetMusicBotStatusResponse.parse(getMusicBotStatus()));
});

router.get("/music/commands", (_req, res) => {
  res.json(GetMusicCommandsResponse.parse(getMusicCommands()));
});

router.get("/music/activity", (_req, res) => {
  res.json(GetMusicActivityResponse.parse(getMusicActivity()));
});

export default router;
