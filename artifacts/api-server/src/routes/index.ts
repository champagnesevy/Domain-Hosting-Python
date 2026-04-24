import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teachersRouter from "./teachers";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/teachers", teachersRouter);
router.use(authRouter);

export default router;
