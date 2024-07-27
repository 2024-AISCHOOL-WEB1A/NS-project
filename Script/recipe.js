

document.addEventListener("DOMContentLoaded", () => {
    // 넌적스 템플릿으로부터 userId 가져오기 (로그인 여부 확인)
    const userId = window.userIdFromTemplate;

    // 뒤로 가기 버튼
    document.getElementById("recipe-goback").addEventListener("click", (e) => {
        history.back();
    })

    // a 태그를 여러개 눌렸을때 색깔 유지
    document.querySelectorAll("#recipe-name a").forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            e.preventDefault(); // 링크 클릭 기본 동작 방지
            anchor.classList.toggle("active"); // 'active' 클래스 토글
        });
    });


    // 추천 버튼 
    document
        .getElementById("recipe-search-button")
        .addEventListener("click", async (e) => {
            // 기본 기능 비활성화
            e.preventDefault();

            // 활성화된 a 태그들 선택
            const activeLinks = document.querySelectorAll(
                "#recipe-name a.active"
            );

            let haveList = [];
            let amountList = [];
            let timeList = [];
            let difficultList = [];
            // 활성화된 a 태그들의 텍스트를 로그에 출력
            activeLinks.forEach((link) => {
                const content = link.querySelector("span").textContent;

                if (["1인분", "2인분", "3인분", "4인분이상"].includes(content)) {
                    amountList.push(content);
                } else if (["15분이내", "30분이내", "60분이내", "2시간이상"].includes(content)) {
                    timeList.push(content);
                } else if (["아무나", "초급", "중급", "고급"].includes(content)) {
                    difficultList.push(content);
                } else {
                    haveList.push(content);
                }
            });

            // 정보 확인
            let have = haveList.join(", ");
            const amount = amountList.join(', ');
            const time = timeList.join(", ");
            const difficult = difficultList.join(", ");

            // have 합치기 (추가 정보 작성 부분과)
            have = `${have}, ${document.getElementById("recipe-search-input").value}`
            // 뒤에 불필요한 문자열 삭제하기
            have = have.trim().replace(/,\s*$/, '');

            // 회원 비회원 구분하기
            if (userId == "" || userId === null || userId === undefined) {
                // 비회원
                // 로그인 하면 다양한 검색이 가능한데 검색할건지 물어보기
                Swal.fire({
                    title: "로그인 확인",
                    text: "로그인을 하시면 추가적인 추천 옵션을 사용할 수 있습니다. 이대로 추천 검색을 하시겠습니까?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "추천 검색",
                    cancelButtonText: "로그인",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        // 서버 api call
                        // have 검사
                        if (have == "") {
                            // 아무것도 없는데 대체 왜?
                            Swal.fire(
                                "추천 실패",
                                "재료를 선택하거나 -list입력하셔야 합니다.",
                                "error"
                            );
                        } else {
                            // 진짜 추천 들어간다
                            try {
                                // 레시피 디테일 페이지로 이동 (api 콜은 그곳에서 하겠다!)
                                window.location.href = `recipe-list?have=${have}`;
                            } catch (e) {
                                console.log(e);
                                Swal.fire(
                                    "추천 실패",
                                    "서버 관리자에게 문의해주세요.",
                                    "error"
                                );
                            }
                        }
                    } else if (result.isDismissed) {
                        window.location.href = "/login";
                    }
                });
            } else {
                // 회원의 경우

            }



            // try {
            //     const res = await axios.get("/api/recipes", {
            //         params: {
            //             have: have.join(", "),
            //         },
            //         withCredentials: true, // 쿠키를 포함하여 요청
            //     });
            //     console.log(res);
            // } catch (err) {
            //     console.error(err);
            // }
        });

    // Element
    // 로그인 되어 있어야만 실행되는 부분
    if (userId != "" && userId != null) {
        // 카메라 앱 작동 (버튼)
        document.getElementById("recipe-camera-button").addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("recipe-camera-input").click();
        });
        // 카메라 앱 작동 (실제 작동)
        document
            .getElementById("recipe-camera-input")
            .addEventListener("change", async (event) => {
                const file = event.target.files[0];
                console.log(file);

                // 파일이 있다면
                if (file) {
                    // 업로드 요청
                    try {
                        // presigned URL 요청
                        const res = await axios.post(
                            "/api/auth/upload-image/recipe-recommend",
                            {
                                fileName: file.name,
                                fileType: file.type,
                            },
                            {
                                withCredentials: true,
                            }
                        );

                        // presigned URL 받기
                        const { key, url } = res.data.data;

                        // S3에 파일 업로드
                        await axios.put(url, file, {
                            headers: {
                                "Content-Type": file.type,
                            },
                        });

                        // TODO : 레시피 추천 받기
                        // const recipePostRes = await axios.post("/api/recipe", {
                        //     // TODO : 레시피 내용 보내기
                        //     photo_url: key,
                        // });

                        event.target.value = "";
                    } catch (err) {
                        console.log(err);
                        //TODO : 오류 핸들링 필요
                    }
                }
            });
    }

    // 로딩화면 제거
    document.getElementById('loading-screen').style.display = 'none';
});
