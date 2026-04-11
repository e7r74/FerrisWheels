// app/page.js
import WheelComponent from './src/components/Wheel' // Убедитесь, что путь верный

export default function Home() {
  return (
    <main>
      {/* Здесь мы вызываем наш компонент */}

      <h1>WebJoldassov</h1>
      <WheelComponent />
    </main>
  )
}
