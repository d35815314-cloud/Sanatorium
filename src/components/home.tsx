import BookingSystem from "./booking/BookingSystem";
import Header from "./layout/Header";
import ProtectedRoute from "./layout/ProtectedRoute";

function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <BookingSystem />
      </div>
    </ProtectedRoute>
  );
}

export default Home;
