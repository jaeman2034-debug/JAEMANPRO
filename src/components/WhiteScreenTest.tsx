import React, { useState, useEffect } from 'react'

const WhiteScreenTest: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('🔍 STT 진단 시작...')
      
      const results: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        url: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        speechRecognition: {
          supported: false,
          type: null,
          error: null
        },
        speechSynthesis: {
          supported: false,
          voices: [],
          error: null
        },
        mediaDevices: {
          supported: false,
          getUserMedia: false,
          enumerateDevices: false,
          error: null
        },
        permissions: {
          microphone: null,
          error: null
        }
      }

      // 1. SpeechRecognition 체크
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
          results.speechRecognition.supported = true
          results.speechRecognition.type = SpeechRecognition.name || 'SpeechRecognition'
          
                     // 객체 생성 테스트
           try {
                           // const recognition = new (window as any).SpeechRecognition()
             results.speechRecognition.objectCreated = true
           } catch (err: any) {
             results.speechRecognition.objectCreated = false
             results.speechRecognition.error = err.message
           }
        }
      } catch (err: any) {
        results.speechRecognition.error = err.message
      }

      // 2. SpeechSynthesis 체크
      try {
        if (window.speechSynthesis) {
          results.speechSynthesis.supported = true
          results.speechSynthesis.voices = window.speechSynthesis.getVoices().map((voice: any) => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
          }))
        }
      } catch (err: any) {
        results.speechSynthesis.error = err.message
      }

      // 3. MediaDevices 체크
      try {
        if (navigator.mediaDevices) {
          results.mediaDevices.supported = true
          results.mediaDevices.getUserMedia = !!navigator.mediaDevices.getUserMedia
          results.mediaDevices.enumerateDevices = !!navigator.mediaDevices.enumerateDevices
          
          // 사용 가능한 장치 목록
          try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            results.mediaDevices.devices = devices.map((device: any) => ({
              kind: device.kind,
              deviceId: device.deviceId,
              label: device.label
            }))
                     } catch (err: any) {
             results.mediaDevices.devicesError = err.message
           }
        }
      } catch (err: any) {
        results.mediaDevices.error = err.message
      }

      // 4. 권한 체크
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' as any })
          results.permissions.microphone = permission.state
        }
      } catch (err: any) {
        results.permissions.error = err.message
      }

      // 5. HTTPS 체크
      results.https = {
        isHttps: window.location.protocol === 'https:',
        isLocalhost: window.location.hostname === 'localhost',
        isSecure: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      }

      setDiagnostics(results)
      setIsLoading(false)
      console.log('📊 진단 결과:', results)
    }

    runDiagnostics()
  }, [])

  const copyToClipboard = () => {
    const text = JSON.stringify(diagnostics, null, 2)
    navigator.clipboard.writeText(text).then(() => {
      alert('진단 결과가 클립보드에 복사되었습니다.')
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">진단 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          🔍 STT 진단 도구
        </h1>

        {/* 요약 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 진단 요약</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded border ${diagnostics.speechRecognition.supported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-sm font-medium">음성 인식</div>
              <div className={`text-lg font-bold ${diagnostics.speechRecognition.supported ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.speechRecognition.supported ? '✅' : '❌'}
              </div>
            </div>
            <div className={`p-3 rounded border ${diagnostics.speechSynthesis.supported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-sm font-medium">음성 합성</div>
              <div className={`text-lg font-bold ${diagnostics.speechSynthesis.supported ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.speechSynthesis.supported ? '✅' : '❌'}
              </div>
            </div>
            <div className={`p-3 rounded border ${diagnostics.mediaDevices.supported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-sm font-medium">미디어 장치</div>
              <div className={`text-lg font-bold ${diagnostics.mediaDevices.supported ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.mediaDevices.supported ? '✅' : '❌'}
              </div>
            </div>
            <div className={`p-3 rounded border ${diagnostics.https.isSecure ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-sm font-medium">보안 환경</div>
              <div className={`text-lg font-bold ${diagnostics.https.isSecure ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.https.isSecure ? '✅' : '❌'}
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📋 상세 진단 정보</h2>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              📋 복사
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 브라우저 정보 */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🌐 브라우저 정보</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>User Agent:</strong> {diagnostics.userAgent}</div>
                <div><strong>Platform:</strong> {diagnostics.platform}</div>
                <div><strong>Language:</strong> {diagnostics.language}</div>
                <div><strong>URL:</strong> {diagnostics.url}</div>
              </div>
            </div>

            {/* SpeechRecognition */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎤 음성 인식 (SpeechRecognition)</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>지원:</strong> {diagnostics.speechRecognition.supported ? '✅' : '❌'}</div>
                {diagnostics.speechRecognition.type && (
                  <div><strong>타입:</strong> {diagnostics.speechRecognition.type}</div>
                )}
                {diagnostics.speechRecognition.objectCreated !== undefined && (
                  <div><strong>객체 생성:</strong> {diagnostics.speechRecognition.objectCreated ? '✅' : '❌'}</div>
                )}
                {diagnostics.speechRecognition.error && (
                  <div><strong>오류:</strong> <span className="text-red-600">{diagnostics.speechRecognition.error}</span></div>
                )}
              </div>
            </div>

            {/* SpeechSynthesis */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔊 음성 합성 (SpeechSynthesis)</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>지원:</strong> {diagnostics.speechSynthesis.supported ? '✅' : '❌'}</div>
                {diagnostics.speechSynthesis.voices.length > 0 && (
                  <div>
                    <strong>사용 가능한 음성:</strong>
                    <div className="mt-1 max-h-32 overflow-y-auto">
                      {diagnostics.speechSynthesis.voices.slice(0, 10).map((voice: any, index: number) => (
                        <div key={index} className="text-xs">
                          {voice.name} ({voice.lang}) {voice.default ? '(기본)' : ''}
                        </div>
                      ))}
                      {diagnostics.speechSynthesis.voices.length > 10 && (
                        <div className="text-xs text-gray-500">... 외 {diagnostics.speechSynthesis.voices.length - 10}개</div>
                      )}
                    </div>
                  </div>
                )}
                {diagnostics.speechSynthesis.error && (
                  <div><strong>오류:</strong> <span className="text-red-600">{diagnostics.speechSynthesis.error}</span></div>
                )}
              </div>
            </div>

            {/* MediaDevices */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎥 미디어 장치 (MediaDevices)</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>지원:</strong> {diagnostics.mediaDevices.supported ? '✅' : '❌'}</div>
                {diagnostics.mediaDevices.supported && (
                  <>
                    <div><strong>getUserMedia:</strong> {diagnostics.mediaDevices.getUserMedia ? '✅' : '❌'}</div>
                    <div><strong>enumerateDevices:</strong> {diagnostics.mediaDevices.enumerateDevices ? '✅' : '❌'}</div>
                    {diagnostics.mediaDevices.devices && (
                      <div>
                        <strong>사용 가능한 장치:</strong>
                        <div className="mt-1">
                          {diagnostics.mediaDevices.devices.filter((d: any) => d.kind === 'audioinput').length}개 마이크
                        </div>
                      </div>
                    )}
                  </>
                )}
                {diagnostics.mediaDevices.error && (
                  <div><strong>오류:</strong> <span className="text-red-600">{diagnostics.mediaDevices.error}</span></div>
                )}
              </div>
            </div>

            {/* 권한 */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔐 권한</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>마이크 권한:</strong> {diagnostics.permissions.microphone || '확인 불가'}</div>
                {diagnostics.permissions.error && (
                  <div><strong>오류:</strong> <span className="text-red-600">{diagnostics.permissions.error}</span></div>
                )}
              </div>
            </div>

            {/* HTTPS */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔒 보안 환경</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><strong>HTTPS:</strong> {diagnostics.https.isHttps ? '✅' : '❌'}</div>
                <div><strong>Localhost:</strong> {diagnostics.https.isLocalhost ? '✅' : '❌'}</div>
                <div><strong>보안 환경:</strong> {diagnostics.https.isSecure ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 권장사항 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💡 권장사항</h2>
          <div className="space-y-2 text-sm">
            {!diagnostics.speechRecognition.supported && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                ❌ <strong>음성 인식 미지원:</strong> Chrome, Edge, Safari 등 최신 브라우저를 사용하세요.
              </div>
            )}
            {!diagnostics.https.isSecure && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                ❌ <strong>보안 환경 필요:</strong> HTTPS 환경에서만 음성 인식이 작동합니다.
              </div>
            )}
            {diagnostics.permissions.microphone === 'denied' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                ❌ <strong>마이크 권한 거부:</strong> 브라우저 설정에서 마이크 권한을 허용하세요.
              </div>
            )}
            {diagnostics.speechRecognition.supported && diagnostics.https.isSecure && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                ✅ <strong>정상:</strong> STT 기능을 사용할 수 있습니다.
              </div>
            )}
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex space-x-4">
          <a 
            href="/stt-test" 
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center"
          >
            🎤 STT 테스트
          </a>
          <a 
            href="/simple-stt-test" 
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-center"
          >
            🎤 간단한 STT 테스트
          </a>
          <a 
            href="/" 
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 text-center"
          >
            🏠 홈으로
          </a>
        </div>
      </div>
    </div>
  )
}

export default WhiteScreenTest 