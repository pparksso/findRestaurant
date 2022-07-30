const searchInput = document.querySelector("#search");
const searchBtn = document.querySelector(".searchBtn");
const hereTitle = document.querySelector(".here");
const list = document.querySelector("#listWrap .list");
const Appkey = "";

// 페이지가 로딩 되자 마자 gps함수 실행
window.onload = gps();

//gps에서 위도, 경도를 찾으면 이 함수 실행(위도,경도로 행정구역 이름 찾아서 타이틀에 넣기, 위도,경도로 근처 음식점 찾아서 txtBox에 정보 넣어주고, 그 음식점 이름으로 이미지 검색해서 이미지 넣어주기)
function onGeoOK(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  // console.log(latitude, longitude);
  let tempTitle = "";
  const inLocation = async () => {
    const res = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${AppKey}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const document = data.documents[0];
        const region = document.region_3depth_name;
        tempTitle = `<span>${region}</span>의 맛집 베스트 15`;
        hereTitle.innerHTML = tempTitle;
      })
      .catch((err) => {
        alert("지역을 특정할 수 없습니다. 검색으로 알아보세요!");
        console.log(err);
      });
  };
  const bestList = async () => {
    const bestSearch = await axios(`https://dapi.kakao.com/v2/local/search/keyword.json?query=맛집&category_group_code=FD6&x=${longitude}&y=${latitude}&radius=10000`, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${AppKey}`,
      },
    })
      .then((res) => {
        const docArr = res.data.documents;
        let tempList = "";
        for (let i = 0; i < docArr.length; i++) {
          axios(`https://dapi.kakao.com/v2/search/image.json?query=${docArr[i].place_name}&size=1`, {
            method: "GET",
            headers: {
              Authorization: `KakaoAK ${AppKey}`,
            },
          }).then((res) => {
            const imgEl = res.data.documents;
            tempList += `<li>
            <a href=${docArr[i].place_url} target=_blank  class="imgBox"><img src="${imgEl[0].thumbnail_url}"alt=""></a>
            <div class="txtBox">
                <a href=${docArr[i].place_url} target=_blank class="title" >
                  <span class="rank">${i + 1}.</span>
                  <span class="name">${docArr[i].place_name}</span>
                </a>
              <p class="address">${docArr[i].road_address_name}</p>
              <p class="desc">${docArr[i].category_name}
              </p>
              <a href=${docArr[i].place_url} target=_blank class="more">${docArr[i].place_name} 더보기<span class="material-icons"> chevron_right </span></a>
            </div>
          </li>`;
            list.innerHTML = tempList;
          });
        }
      })
      .catch((err) => {
        alert("주변의 맛집을 찾을 수 없어요! 검색으로 알아보세요!");
        console.log(err);
      });
  };
  inLocation();
  bestList();
}

//gps를 찾지 못했을 때
function onGeoError() {
  alert("위치를 찾을 수 없어요. 검색으로 알아보세요!");
}

//현재 위치 위도, 경도로 찾기
function gps() {
  navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);
}

//키워드로 음식점 찾는 함수
const regionSearch = async (value) => {
  const searchResult = await axios(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${value}&category_group_code=FD6&radius=10000&size=15`, {
    method: "GET",
    headers: {
      Authorization: `KakaoAK ${AppKey}`,
    },
  }).then((res) => {
    const searchArr = res.data.documents;
    let tempSearchList = "";
    for (let i = 0; i < searchArr.length; i++) {
      axios(`https://dapi.kakao.com/v2/search/image.json?query=${searchArr[i].place_name}&size=1`, {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${AppKey}`,
        },
      }).then((res) => {
        const imgEl = res.data.documents;
        tempSearchList += `<li>
            <a href=${searchArr[i].place_url} target=_blank  class="imgBox"><img src="${imgEl[0].thumbnail_url}"alt=""></a>
            <div class="txtBox">
                <a href=${searchArr[i].place_url} target=_blank class="title" >
                  <span class="rank">${i + 1}.</span>
                  <span class="name">${searchArr[i].place_name}</span>
                </a>
              <p class="address">${searchArr[i].road_address_name}</p>
              <p class="desc">${searchArr[i].category_name}
              </p>
              <a href=${searchArr[i].place_url} target=_blank class="more">${searchArr[i].place_name} 더보기<span class="material-icons"> chevron_right </span></a>
            </div>
          </li>`;
        list.innerHTML = tempSearchList;
      });
    }
  });
};

//검색 이벤트 후 실행되는 함수
const search = () => {
  const value = searchInput.value;
  regionSearch(value);
  let tempTitle = "";
  tempTitle = `<span>${value}</span>의 맛집`;
  hereTitle.innerHTML = tempTitle;
};

//검색어를 치고 엔터를 쳤을 때
searchInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    search();
  }
});

// 검색어를 치고 버튼을 눌렀을 때
searchBtn.addEventListener("click", () => {
  const value = searchInput.value;
  if (value === "") {
    alert("검색어를 입력해주세요");
  } else {
    search();
  }
});

//해결해야할문제!
//1. 반복문이 순서대로 돌지않고 랜덤으로 호출된다
//두번째 then에서 undefined가 뜸...
// const bestList = async () => {
//   const bestSearch = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=맛집&category_group_code=FD6&x=126.795776&y=37.4767616&radius=10000`, {
//     method: "GET",
//     headers: {
//       Authorization: `KakaoAK ${AppKey}`,
//     },
//   })
//     .then((res) => {
//       res.json();
//     })
//     .then((data) => {
//       console.log(data);
//     })
//     .catch((err) => {
//       alert("주변의 맛집을 찾을 수 없어요! 검색으로 알아보세요!");
//       console.log(err);
//     });
// };
// bestList();
