import React,{useEffect,useState} from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function User() {
  // Sample data for demonstration 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
       const fetchData = async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/users')
            setUsers(response.data.data);
            setLoading(false);       
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    fetchData()
    },[]
);


const deleteUser = async (id) => {
  if (confirm("Are you sure you want to delete this user?")) {
  
      await axios.delete(`http://localhost:8000/api/delete/user/${id}`)
      .then((response) => {
        setUsers(users.filter(user => user._id !== id));
        toast.success(response.data.Message,{position:'top-right'});
      })
      
      .catch ((error)=> {
      console.error('Error deleting user:', error);
    
       }); 
      } 
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Table header */}
          <div className="p-5 bg-white border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <Link to ="/add" className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200">
                <UserPlus size={16} color="white" strokeWidth={1.5} />
                <span>Add User</span>
              </Link>
            </div>
          </div>
          
          {/* Table container with shadow to distinguish from background */}
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 border-b text-center text-xs font-medium uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? 
                 (<tr>
                    <td colSpan={5} className="text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>)
                 : 
                (users.map((user, index) =>(
                  <tr 
                    key={user._id} 
                    className={`
                      transition-colors duration-150 hover:bg-blue-50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    `}
                  >
                    <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.address}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-center">
                      <div className="flex justify-center space-x-2">
                        <Link to={"/update/"+user._id} 
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200 transition-colors duration-150 group"
                        >
                          <Edit size={14} className="mr-1 group-hover:text-blue-800" />
                          <span>Edit</span>
                        </Link>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200 transition-colors duration-150 group"
                        >
                          <Trash2 size={14} className="mr-1 group-hover:text-red-800" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;

