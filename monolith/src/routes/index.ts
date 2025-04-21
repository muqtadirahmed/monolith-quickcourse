import { Router } from "express";
import { studentBenefit } from "../controller/students/student.controller";
import { signin, signup } from "../controller/auth/auth.controller";

const router = Router()

router.post("/signin", signin)
router.post("/signup", signup)
router.post("/student-benefit", studentBenefit)
export default router