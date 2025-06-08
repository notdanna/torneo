import SearchPage from '../frontend/src/features/pages/SearchPage.tsx';

function App() {
  const handleSearch = (query: string) => {
    console.log('Búsqueda realizada:', query);
    // Aquí puedes agregar tu lógica de búsqueda
  };

  return (
    <SearchPage 
      onSearch={handleSearch}
      placeholder="Buscar invitado"
    />
  );
}

export default App;