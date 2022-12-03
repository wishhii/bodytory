import type { NextApiRequest, NextApiResponse } from "next";
import client from "utils/server/client";
import withHandler from "@utils/server/withHandler";
import { withApiSession } from "@utils/server/withSession";
import * as bcrypt from "bcrypt";
import { RegisterForm } from "pages/auth/register";
import { passwordEncryption } from "utils/server/passwordHelper";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accountId, password, email, name, birth, gender, type, phone }: RegisterForm = req.body;

  const newUser = await client.user.create({
    data: {
      type,
      accountId,
      name,
      birth,
      gender,
      email,
      phone,
      password: await passwordEncryption(password),
    },
  });
  req.session.user = {
    id: newUser.id,
  };
  await req.session.save();
  return res.status(200).end();
}
export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));