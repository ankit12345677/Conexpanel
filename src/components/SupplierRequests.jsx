// import React, { useState } from 'react';

// const SupplierRequests = () => {
//   const [requests, setRequests] = useState([
//     {
//       id: 1,
//       name: 'Supplier One',
//       company: 'Company A',
//       email: 'supplier1@example.com',
//       product: 'Product X',
//       description: 'This is a high-quality product with excellent features.',
//       image: 'https://via.placeholder.com/150',
//       status: 'pending'
//     },
//     {
//       id: 2,
//       name: 'Supplier Two',
//       company: 'Company B',
//       email: 'supplier2@example.com',
//       product: 'Product Y',
//       description: 'A revolutionary product that will change the market.',
//       image: 'https://via.placeholder.com/150',
//       status: 'pending'
//     },
//     {
//       id: 3,
//       name: 'Supplier Three',
//       company: 'Company C',
//       email: 'supplier3@example.com',
//       product: 'Product Z',
//       description: 'Eco-friendly product with sustainable materials.',
//       image: 'https://via.placeholder.com/150',
//       status: 'pending'
//     }
//   ]);

//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const handleViewDetails = (request) => {
//     setSelectedRequest(request);
//     setShowModal(true);
//   };

//   const handleApprove = (id) => {
//     setRequests(requests.map(request => 
//       request.id === id ? { ...request, status: 'approved' } : request
//     ));
//     setShowModal(false);
//   };

//   const handleReject = (id) => {
//     setRequests(requests.map(request => 
//       request.id === id ? { ...request, status: 'rejected' } : request
//     ));
//     setShowModal(false);
//   };

//   return (
//     <div>
//       <div className="dashboard-header">
//         <h2>Supplier Requests</h2>
//       </div>

//       <div className="card">
//         <div className="card-header">
//           <h3>Pending Requests</h3>
//         </div>
//         <div className="request-list">
//           {requests.filter(req => req.status === 'pending').map(request => (
//             <div key={request.id} className="request-item">
//               <div className="request-info">
//                 <h4>{request.name} - {request.company}</h4>
//                 <p>Product: {request.product}</p>
//                 <p>Email: {request.email}</p>
//               </div>
//               <div className="request-actions">
//                 <button 
//                   className="btn btn-primary btn-sm"
//                   onClick={() => handleViewDetails(request)}
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-header">
//           <h3>Processed Requests</h3>
//         </div>
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Supplier</th>
//               <th>Company</th>
//               <th>Product</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {requests.filter(req => req.status !== 'pending').map(request => (
//               <tr key={request.id}>
//                 <td>{request.name}</td>
//                 <td>{request.company}</td>
//                 <td>{request.product}</td>
//                 <td>
//                   <span className={`status-badge status-${request.status}`}>
//                     {request.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedRequest && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3>Request Details</h3>
//               <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
//             </div>
//             <div className="modal-body">
//               <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
//                 <img 
//                   src={selectedRequest.image} 
//                   alt={selectedRequest.product} 
//                   style={{ width: '150px', height: '150px', objectFit: 'cover' }}
//                 />
//                 <div>
//                   <h4>{selectedRequest.name}</h4>
//                   <p><strong>Company:</strong> {selectedRequest.company}</p>
//                   <p><strong>Email:</strong> {selectedRequest.email}</p>
//                   <p><strong>Product:</strong> {selectedRequest.product}</p>
//                 </div>
//               </div>
//               <div>
//                 <h4>Description</h4>
//                 <p>{selectedRequest.description}</p>
//               </div>
//             </div>
//             <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
//               <button 
//                 className="btn btn-success"
//                 onClick={() => handleApprove(selectedRequest.id)}
//               >
//                 Approve
//               </button>
//               <button 
//                 className="btn btn-danger"
//                 onClick={() => handleReject(selectedRequest.id)}
//               >
//                 Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SupplierRequests;