import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-center">
      {/* 로고 */}
      <div className="w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-3xl font-bold text-white">야고</span>
      </div>

      {/* 슬로건 */}
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        스포츠의 시작, 야고
      </h1>
      <p className="text-sm text-gray-700 mb-4">
        체육인 커뮤니티, 장터, 모임까지 <br />
        지금 위치를 선택하고 시작해보세요!
      </p>

      {/* 위치 선택 */}
      <div className="flex items-center justify-center mb-6 bg-gray-50 px-4 py-2 rounded-lg">
        <span className="text-xl mr-2">🇰🇷</span>
        <span className="text-base font-semibold text-gray-900">대한민국</span>
        <span className="ml-2 text-gray-500">▼</span>
      </div>

      {/* 시작 버튼 */}
      <button
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-base shadow-md hover:bg-orange-600 transition mb-4"
        onClick={() => navigate("/register")}
      >
        시작하기
      </button>

      {/* 로그인 링크 */}
      <p className="text-sm text-gray-600">
        이미 계정이 있나요?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-orange-500 font-semibold"
        >
          로그인
        </button>
      </p>
    </div>
  );
} 