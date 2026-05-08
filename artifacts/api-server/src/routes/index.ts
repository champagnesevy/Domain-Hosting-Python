import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import authRouter from "./auth";
import teachersRouter from "./teachers";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/students", studentsRouter);
router.use(authRouter);
router.use(teachersRouter);

export default router;
