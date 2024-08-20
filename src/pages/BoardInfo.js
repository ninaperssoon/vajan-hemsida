import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function BoardInfo () {
    const boardInfoCollectionRef = collection(db, "boardInfo");
    const [boardInfoList, setBoardInfoList] = useState([]);

    const getBoardInfo = async () => {
        try {
            const q = query(boardInfoCollectionRef, orderBy("placement"));
            const querySnapshot = await getDocs(q);
            const boardInfo = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setBoardInfoList(boardInfo);
          } catch (error) {
            console.error("Error fetching posts:", error);
          }
    }

    useEffect(() => {
        getBoardInfo();
      }, []);

    return (
        <div className="container album-container">
            <h1 className="mt-5">Styrelsen</h1>
            <div className="mt-5 mb-5">
                <p className="info-text">Vajans styrelse består av 12 poster med specifika arbetsuppgifter. Kanske lite om vad det innebär överlag att sitta i styrelsen eller nåt....</p>
            </div>

            <div>
                {boardInfoList.map((boardInfo) => (
                    <div className="row d-flex align-items-center">
                        <div className="board-info-container p-4 mb-4 col-sm-9">
                            <h2>{boardInfo.position}</h2>
                            <p className="board-info-text">{boardInfo.description}</p>
                        </div>
                        <div className="col-sm-3">
                            <img className="board-info-logo" src="https://images.squarespace-cdn.com/content/v1/60b3ec842f1b2b7584b218da/9b9e58f0-89e0-4c7c-98a2-2fdeb10759ed/vitV.png?format=1500w"></img>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BoardInfo;