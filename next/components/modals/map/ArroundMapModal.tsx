import { RoundButton } from "@components/layout/buttons/Button";
import { ToryText, ToryText26 } from "@styles/Common";
import styled from "styled-components";
import { NextPage } from "next";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ModalContainer, ModalWrapper, Dim } from "@styles/ModalStyled";
import useCoords from "@hooks/useCoords";
import ArroundMap from "@components/map/ArroundMap";
import useDepartmentSelect from "@hooks/useDepartmentSelect";
import { useEffect, useState } from "react";
import useUser from "@hooks/useUser";
import usePortal from "@hooks/usePortal";

interface ArroundMapMaodalProps {
  onClose: () => void;
  mostThreeDepartment: string[] | undefined;
  longitude: number | null;
  latitude: number | null;
}
const ArroundMapModal: NextPage<ArroundMapMaodalProps> = ({ onClose, mostThreeDepartment, longitude, latitude }) => {
  const { user } = useUser();
  const { department, DepartmentSelect } = useDepartmentSelect(mostThreeDepartment ? mostThreeDepartment : []);
  const Portal = usePortal();

  const modalContent = (
    <AnimatePresence>
      <ModalWrapper>
        <Dim onClick={onClose} />
        <ModalPaddingContainer flex width="1500px" height="800px">
          <ToryText26>
            현재 <strong>{user?.name}님</strong>의 위치를 기준으로 주변 <strong>{mostThreeDepartment?.join(", ")}</strong>들을 찾았어요!
          </ToryText26>
          <DepartmentSelect />

          <ArroundMap width="1500px" height="600px" longitude={longitude} latitude={latitude} department={department} />

          <ButtonBox>
            <RoundButton fontSize="16px" width="220px" height="40px" onClick={onClose}>
              닫기
            </RoundButton>
          </ButtonBox>
        </ModalPaddingContainer>
      </ModalWrapper>
    </AnimatePresence>
  );

  return Portal({ children: modalContent });

};
export default ArroundMapModal;

const ModalPaddingContainer = styled(ModalContainer)`
  padding: 30px 0 10px;
`;

const ButtonBox = styled.div`
  button {
    margin: 0 auto;
  }
`;