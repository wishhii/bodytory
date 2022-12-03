import { Position, Record, RecordImage } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import customApi from "@utils/client/customApi";
import { RECORDS_DELETE, RECORDS_READ } from "constant/queryKeys";
import React, { ChangeEvent, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { uploadImageApi } from "@utils/client/imageApi";
import uploadImage from "@utils/client/uploadImage";
import IconAddImage from "@public/static/icon/icon_addImage.png";
import ToriQuestion from "@public/static/icon/toriQuestion.png";
import RecordModal, { RecordWithImage } from "@components/modals/RecordModal";
import { KoreanPosition } from "types/write";
import { useRouter } from "next/router";
import checkIcon from "@public/static/icon/icon_checkbox.png";
import checkedIcon from "@public/static/icon/checkbox_checked.png";

export interface RecordWithImageAndHospital extends Record {
  images: RecordImage[];
  hospital?: { name: string };
}

function ChartTimeline() {

  const { query } = useRouter();
  const position = query.position as Position;

  const queryClient = useQueryClient();
  const { getApi } = customApi(`/api/users/records/${position}`);
  const { deleteApi } = customApi(`/api/users/records`);

  // 여기 key 2개 넣고, useEffect까지 써야지 되는 이 부분 나중에 리팩토링하기 (일단 기능은 맞게 동작)
  const { isLoading, data } = useQuery<RecordWithImageAndHospital[] | undefined>([RECORDS_READ, position], getApi, {
    onSuccess(data) {
      setRecords(data);
    },
    enabled: !!position,
  });

  useEffect(() => {
    queryClient.invalidateQueries([RECORDS_READ, position]);
    setFilterItem("all"); // 부위마다 새로운 페이지가 아닌가..? 왜 이걸 해줘야하지
  }, [position]);


  const [records, setRecords] = useState<RecordWithImageAndHospital[] | undefined>();

  const { mutate } = useMutation([RECORDS_DELETE], deleteApi, {
    onSuccess() {
      queryClient.invalidateQueries([RECORDS_READ, position]);
    },
  });


  // 기록 삭제
  const [confirmDelete, setConfirmDelete] = useState(-1);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, recordId: number) => {
    if (confirmDelete !== -1) {
      mutate({ id: confirmDelete });
    } else {
      setConfirmDelete(recordId);
    }
  };

  // 이미지 업로드
  const uploadImageMutation = useMutation(uploadImageApi, {
    onSuccess(data) {
      queryClient.invalidateQueries([RECORDS_READ]);
    },
  });

  // 상세 모달
  const [showRecordModal, setShowRecordModal] = useState(-1);

  const handleRecordModal = (record: RecordWithImage) => {
    setShowRecordModal(record.id);
  };


  // 모아보기 필터링
  const [filterItem, setFilterItem] = useState<string>("all");
  const [filtredRecord, setFiltredRecord] = useState<RecordWithImageAndHospital[] | undefined>();

  const handleRadioChange = (event: any) => {
    setFilterItem(event.target.value);
  };

  useEffect(() => {
    setFiltredRecord(records);
  }, [records]);

  useEffect(() => {
    if (filterItem === "all") {
      setFiltredRecord(records);
    } else {
      setFiltredRecord(records?.filter((record) => record.type === filterItem));
    }
  }, [filterItem]);


  return (
    <>
      <TimelineContainer>
        <Timeline>
          <Filter>
            <div>
              <input type="radio" name="filter" id="all" value="all" onChange={handleRadioChange} checked={filterItem === "all"} />
              <label htmlFor="all"><i />전체</label>
            </div>
            <div>
              <input type="radio" name="filter" id="user" value="user" onChange={handleRadioChange} checked={filterItem === "user"} />
              <label htmlFor="user"><i />증상기록 모아보기</label>
            </div>
            <div>
              <input type="radio" name="filter" id="hospital" value="hospital" onChange={handleRadioChange} checked={filterItem === "hospital"} />
              <label htmlFor="hospital"><i />병원기록 모아보기</label>
            </div>
          </Filter>
          {filtredRecord?.length === 0 ? (
            <NoRecord>
              <img src={ToriQuestion.src} />
              <p>
                <strong>{KoreanPosition[position!]}</strong>에 대한 기록이 없습니다
              </p>
            </NoRecord>
          ) : (
            filtredRecord?.map((record, index) => (
              <RecordBox key={index}>
                <Time byUser={record.type === "user"}>
                  {format(new Date(record.createAt), "yyyy년 M월 d일 EEEE aaaa h시 m분", { locale: ko })}
                </Time>
                {record.type === "user" ? (
                  <>
                    <Content>
                      <Description cursorType={"pointer"}>
                        <Text onClick={() => handleRecordModal(record)}>{record.description}</Text>
                        <ImageBox>
                          {record.images.length ? (
                            <Thumbnail onClick={() => handleRecordModal(record)}>
                              <ThumbnailImage src={record.images[0].url} />
                              {record.images.length > 1 && <span>+{record.images.length - 1}장</span>}
                            </Thumbnail>
                          ) : (
                            <UploadImageButton
                              onClick={() => uploadImage(String(record.id), uploadImageMutation.mutate)}
                            >
                              <span className="blind">사진 추가</span>
                            </UploadImageButton>
                          )}
                        </ImageBox>
                      </Description>

                      <DeleteButton
                        onClick={e => handleClick(e, record.id)}
                        recordId={record.id}
                        className={confirmDelete === record.id ? "active" : ""}
                        onBlur={() => setConfirmDelete(-1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                        </svg>
                        <span>삭제</span>
                      </DeleteButton>
                    </Content>
                    {showRecordModal === record.id && (
                      <RecordModal record={record} setShowRecordModal={setShowRecordModal} />
                    )}
                  </>
                ) : (
                  <Content>
                    <Description cursorType={"auto"}>
                      <HospitalName>{record.hospital?.name}</HospitalName>
                      <ResultTable>
                        <TableRow>
                          <span>진단 결과</span>
                          <p>{record.diagnosis}</p>
                        </TableRow>
                        <TableRow>
                          <span>처방 내용</span>
                          <p>{record.prescription}</p>
                        </TableRow>
                        <TableRow>
                          <span>상세 소견</span>
                          <p>{record.description}</p>
                        </TableRow>
                      </ResultTable>
                    </Description>
                  </Content>
                )}
              </RecordBox>
            ))
          )}
        </Timeline>
      </TimelineContainer>
    </>
  );
}

const TimelineContainer = styled.div`
  position: relative;
  min-height: 500px;
  background: #f4f5ff;
  padding: 30px 40px;
  border-radius: 40px;
`;

const Filter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;

  & > div {
    margin: 0 10px;
  }

  label {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #B2B5CC;
    cursor: pointer;
    transition: color .2s;

    i {
      display: block;
      width: 16px;
      height: 16px;
      background: url(${checkIcon.src}) no-repeat 50% 50%/cover;
      margin-right: 5px;
      transition: background .2s, opacity .2s;
    }

    &:hover {
      color: #82859C;

      i {
        background-image: url(${checkedIcon.src});
        opacity: .35;
      }
    }
  }

  input {
    position: absolute;
    left: -999999%;

    &:checked + label {
      color: ${({ theme }) => theme.color.text};
      pointer-events: none;
      
      i {
        background-image: url(${checkedIcon.src});
      }
    }
  }
`;

const Timeline = styled.div``;

const NoRecord = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  img {
    display: block;
    width: 120px;
    margin: 0 auto 30px;
  }

  p {
    font-size: 20px;
    font-weight: 500;

    strong {
      font-weight: 700;
    }
  }
`;

const RecordBox = styled.div`
  position: relative;
  padding-left: 20px;

  &:before {
    content: "";
    position: absolute;
    top: 16px;
    left: 0;
    width: 1px;
    height: calc(100% + 40px);
    background: #363cbf;
  }

  &:last-child:before {
    display: none;
  }

  & + & {
    margin-top: 40px;
  }
`;

const Time = styled.div<{ byUser: boolean }>`
  position: relative;
  padding: 10px;
  font-size: 16px;

  &:after {
    content: "";
    position: absolute;
    top: calc(10px + 6px);
    left: calc(-20px - 8px);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    ${({ byUser }) =>
      byUser
        ? css`
            box-sizing: border-box;
            background: #fff;
            border: 4px solid #5359e9;
          `
        : css`
            background: #03e7cb;
          `}
  }
`;

const Content = styled.div`
  position: relative;
`;

const Description = styled.div<{ cursorType: string }>`
  position: relative;
  background: #ebecfc;
  border-radius: 20px;
  overflow: hidden;
  cursor: ${({ cursorType }) => cursorType};
`;

const Text = styled.div`
  min-height: 140px;
  padding: 20px 200px 20px 30px;
`;

const ImageBox = styled.div`
  position: absolute;
  top: 50%;
  right: 90px;
  transform: translate(0, -50%);
  width: 80px;
  height: 80px;
  border-radius: 15px;
  overflow: hidden;
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 100%;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(87, 88, 120, 0.5);
    z-index: 1;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${({ theme }) => theme.color.white};
    font-size: 16px;
    font-weight: 500px;
    z-index: 5;
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadImageButton = styled.button`
  width: 100%;
  height: 100%;
  background: #d7d9f6 url(${IconAddImage.src}) no-repeat 50% 50%/50%;
  cursor: pointer;
`;

const DeleteButton = styled.button<{ recordId: number }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  background: #d9deff;
  border-radius: 0 20px 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.4s, width 0.4s;

  svg {
    width: 22px;
    height: 22px;
    fill: #8c9af3;
    transition: transform 0.4s;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 40px;
    z-index: -1;
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.color.white};
    margin-top: 7px;
    opacity: 0;
    transition: opacity 0.4s, zIndex 0.4s, transform 0.4s;
  }

  &:hover {
    background: #c6cdfa;

    svg {
      fill: #5359e9;
    }
  }

  &.active {
    width: 70px;
    background: ${({ theme }) => theme.color.error};

    svg {
      transform: translate(0, -5px);
      fill: #fff;
    }

    span {
      opacity: 1;
      z-index: 1;
      transform: translate(-50%, 5px);
    }
  }
`;

const HospitalName = styled.div`
  background: #4b50d3;
  color: ${({ theme }) => theme.color.white};
  font-weight: 500;
  padding: 15px 30px;
`;

const ResultTable = styled.div`
  padding: 30px 40px;
`;

const TableRow = styled.div`
  display: flex;

  & + & {
    margin-top: 15px;
  }

  span {
    font-weight: 700;
    margin-right: 100px;
  }

  p {
  }
`;

export default ChartTimeline;