import Header from '@/components/Header';
import VaccineScheduler from '../components/VaccineScheduler';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <Header></Header>
      <VaccineScheduler />
    </div>
  );
}