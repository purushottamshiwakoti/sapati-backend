import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
       

        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 400 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 400 });
        }

        const user=await getUserById(existingToken.user_id);
        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        const status=req.nextUrl.searchParams.get("status");
        const search=req.nextUrl.searchParams.get("search");

        const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
        const pgsize: number = 10;

        let data;

        let [borrowings, lendings] = await Promise.all([
          prismadb.borrowings.findMany({
              where: { user_id: existingToken.user_id },
              include: { sapati: true, user: true },
              orderBy: { created_at: "desc" },
          }),
          prismadb.lendings.findMany({
              where: { user_id: existingToken.user_id },
              include: { sapati: true, user: true },
              orderBy: { created_at: "desc" },
          }),
      ]);

      const processItems = async (items:any) => {
          const processedItems = [];
          for (const item of items) {
              const phone = parseInt(item.sapati.phone);
              if (!isNaN(phone)) {
                  const borrower_user = await getUserByPhone(phone);
                  const creatorUser = await getUserById(item.sapati.created_by!);
                  const phone_number = creatorUser?.id === existingToken.user_id
                      ? borrower_user?.phone_number
                      : creatorUser?.phone_number;
                  const fullName = creatorUser?.id === existingToken.user_id
                      ? (borrower_user?.first_name?.trim() ?? "") + (borrower_user?.last_name?.trim() ?? "")
                      : (creatorUser?.first_name?.trim() ?? "") + (creatorUser?.last_name?.trim() ?? "");
                  item.user_id = borrower_user?.id || "";
                  item.user.first_name = borrower_user?.first_name || "";
                  item.user.last_name = borrower_user?.last_name || "";
                  item.user.fullName = fullName;
                  item.user.is_verified = borrower_user?.is_verified || false;
                  item.user.image = existingToken.user_id == item.sapati.created_by
                      ? borrower_user?.image ?? null
                      : creatorUser?.image ?? null;
                  item.user.phone_number = phone_number!;
                  processedItems.push(item);
              } else {
                  console.log(`Index: ${item}, Invalid phone number: ${item.sapati.phone}`);
              }
          }
          return processedItems;
      };

      const processedBorrowings = await processItems(borrowings);
      const processedLendings = await processItems(lendings);

      const sapatiTaken = processedBorrowings.map((item) => ({
          user_id: item.user_id,
          sapati_id: item.sapati_id,
          first_name: item.user.first_name,
          last_name: item.user.last_name,
          isverified: item.user.is_verified,
          created_at: item.sapati.created_at,
          status: "Borrowed",
          sapati_status: item.sapati.sapati_satatus,
          confirm_settlement: item.sapati.confirm_settlement,
          amount: item.sapati.amount,
          image: item.user.image,
          creatorId: item.sapati.created_by,
          currentUserId: existingToken.user_id,
          userName: item.sapati.created_user_name,
          userImage: item.sapati.created_user_image,
          phone_number: item.user.phone_number,
          fullName: item.user.fullName,
      }));

      const sapatiGiven = processedLendings.map((item) => ({
          user_id: item.user_id,
          sapati_id: item.sapati_id,
          first_name: item.user.first_name,
          last_name: item.user.last_name,
          isverified: item.user.is_verified,
          created_at: item.sapati.created_at,
          status: "Lent",
          sapati_status: item.sapati.sapati_satatus,
          confirm_settlement: item.sapati.confirm_settlement,
          amount: item.sapati.amount,
          image: item.user.image,
          creatorId: item.sapati.created_by,
          currentUserId: existingToken.user_id,
          userName: item.sapati.created_user_name,
          userImage: item.sapati.created_user_image,
          phone_number: item.user.phone_number,
          fullName: item.user.fullName,
      }));
      

        data=[...sapatiGiven,...sapatiTaken]


        if (status === 'given') {
          if(search){
            const searchTerm = search.toLowerCase();
            data = data
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .filter(item => item.status === "Lent" && (item.sapati_status === "APPROVED"||item.sapati_status=="SETTLED")&&item.creatorId!=item.currentUserId?item.fullName?.toLowerCase().startsWith(searchTerm):item.first_name?.toLowerCase().startsWith(searchTerm))
                .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
          }else{
            data = data
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .filter(item => item.status === "Lent" && (item.sapati_status === "APPROVED"||item.sapati_status=="SETTLED"))
            .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
          }
      } else if (status === 'taken') {
        if(search){
          const searchTerm = search.toLowerCase();
          data = data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .filter(item => item.status === "Borrowed" && (item.sapati_status === "APPROVED"||item.sapati_status=="SETTLED")&&item.creatorId!=item.currentUserId?item.fullName?.toLowerCase().startsWith(searchTerm):item.first_name?.toLowerCase().startsWith(searchTerm))
          .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
        }
          data = data
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .filter(item => item.status === "Borrowed" && (item.sapati_status === "APPROVED"||item.sapati_status=="SETTLED"))
              .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
      } else if (status === 'active') {
        if(search){
            console.log(search);
          const searchTerm = search.toLowerCase();
          data = data
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            //   .filter(item => item.sapati_status === "PENDING"&&item.creatorId!=item.currentUserId?item.fullName?.toLowerCase().startsWith(searchTerm):item.first_name?.toLowerCase().startsWith(searchTerm))
              .filter(item => item.sapati_status === "APPROVED"&&!item.confirm_settlement&&item.creatorId!=item.currentUserId?item.fullName?.toLowerCase().startsWith(searchTerm):item.first_name?.toLowerCase().startsWith(searchTerm))
              .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
        }else{
        
          data = data
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            //   .filter(item => item.sapati_status === "PENDING")
              .filter(item => item.sapati_status === "APPROVED"&&!item.confirm_settlement)
              .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
        }
          
      } else {
        if(search){
          const searchTerm = search.toLowerCase();
          data = data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).filter((item)=>item.creatorId!=item.currentUserId?item.fullName?.toLowerCase().startsWith(searchTerm):item.first_name?.toLowerCase().startsWith(searchTerm))
          .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
        }else{
          data = data
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).filter((item)=>item.sapati_status!="DECLINED")
              .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);
        }
      }




        return NextResponse.json({message:"Successfully fetched transactions",data},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}