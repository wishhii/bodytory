/**
 * 선택한 이미지 파일을 formdata로 만들어 인자값으로 넘겨준 mutate를 통해 사진 업로드를 한다
 * @param id -recordId
 * @param mutate  - mutate 함수
 */

import { UseMutateFunction } from "@tanstack/react-query";
import customApi from "./customApi";

const uploadImage = async (id: number, mutate: UseMutateFunction<any, unknown, any, unknown>) => {
  const { getApi } = customApi("/api/users/records/picture/get-url");

  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.multiple = true;
  input.click();

  input.addEventListener("change", async () => {
    try {
      const formData = new FormData();
      const { uploadURL } = await getApi();
      console.log(input?.files![0]);
      // Array.from(input?.files!).forEach(file => formData.append("image", file));
      formData.append("file", input?.files![0]);
      const {
        result: { id: cloudId },
      } = await (
        await fetch(uploadURL, {
          method: "POST",
          body: formData,
        })
      ).json();
      mutate({ recordId: id, url: `${process.env.NEXT_PUBLIC_IMG_URL}/${cloudId}/public` });
    } catch (err) {
      console.log(err);
    }
  });
};

export default uploadImage;
