import logo from './logo.svg';
import './App.css';
import ListUser from './components/ListUser'
import AddUser from './components/AddUser';
import CreateRoutine from './components/CreateRoutine'

function App() {
  return (
    <div className="App">
      <ListUser/>
      <AddUser/>
      <CreateRoutine/>
      {console.log("Hola")}

    </div>
  );
}

export default App;
