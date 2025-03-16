import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const OpportunitiesList = () => {
    const [opportunities, setOpportunities] = useState([]);

    useEffect(() => {
        const fetchOpportunities = async () => {
            const querySnapshot = await getDocs(collection(db, 'opportunities'));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOpportunities(data);
        };
        fetchOpportunities();
    }, []);

    return (
        <ul>
            {opportunities.map(opportunity => (
                <li key={opportunity.id} className="p-2 border-b">
                    {opportunity.title} - {opportunity.description}
                </li>
            ))}
        </ul>
    );
};

export default OpportunitiesList;
