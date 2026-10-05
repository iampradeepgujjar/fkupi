import { CASHFREE_CONFIG } from '../../../lib/cashfree';

function getOrigin(request: Request): string {
  const originHeader = request.headers.get('origin');
  if (originHeader && originHeader !== 'null') {
    return originHeader.replace(/\/+$/, '');
  }

  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1') ? 'http' : 'https');
    return `${proto}://${forwardedHost}`.replace(/\/+$/, '');
  }

  try {
    const url = new URL(request.url);
    return url.origin;
  } catch {
    return '';
  }
}

const INDIAN_FIRST_NAMES = [
  // Male names
  'Aarav', 'Aarush', 'Aayush', 'Abhay', 'Abhinav', 'Abhishek', 'Adarsh', 'Aditya', 'Advait', 'Ajay',
  'Akash', 'Akhil', 'Akshay', 'Alok', 'Aman', 'Amar', 'Amit', 'Amol', 'Anand', 'Aniket',
  'Anil', 'Aniruddh', 'Ankit', 'Anmol', 'Ansh', 'Anurag', 'Arjun', 'Arun', 'Arvind', 'Ashish',
  'Ashok', 'Ashutosh', 'Atul', 'Ayush', 'Bharat', 'Bhavesh', 'Bhupendra', 'Bipin', 'Chandan', 'Chetan',
  'Chirag', 'Darshan', 'Deepak', 'Devesh', 'Devendra', 'Dhananjay', 'Dhiraj', 'Dhruv', 'Dilip', 'Dinesh',
  'Dipen', 'Divyansh', 'Gajendra', 'Ganesh', 'Gaurav', 'Gautam', 'Girish', 'Gopal', 'Govind', 'Hardik',
  'Hari', 'Harish', 'Harsh', 'Harshit', 'Hemant', 'Hitesh', 'Inder', 'Ishan', 'Jagdish', 'Jatin',
  'Jay', 'Jayant', 'Jayesh', 'Jitendra', 'Kamal', 'Kapil', 'Karan', 'Kartik', 'Kaushik', 'Keshav',
  'Kishore', 'Krunal', 'Kuldeep', 'Kunal', 'Laksh', 'Lakshman', 'Lalit', 'Lokesh', 'Madhav', 'Mahesh',
  'Manish', 'Manoj', 'Mayank', 'Mayur', 'Mihir', 'Milan', 'Mohit', 'Mukesh', 'Nakul', 'Naman',
  'Naresh', 'Naveen', 'Navin', 'Neeraj', 'Nikhil', 'Nilesh', 'Nimesh', 'Nitin', 'Om', 'Omprakash',
  'Pankaj', 'Paras', 'Paresh', 'Parth', 'Parveen', 'Pawan', 'Piyush', 'Pradeep', 'Prakash', 'Pramod',
  'Prashant', 'Prateek', 'Pratik', 'Praveen', 'Prem', 'Priyansh', 'Raghav', 'Rahul', 'Raj', 'Rajan',
  'Rajat', 'Rajeev', 'Rajesh', 'Rakesh', 'Ram', 'Ramesh', 'Ranveer', 'Ravi', 'Ravindra', 'Rishabh',
  'Ritesh', 'Rohan', 'Rohit', 'Ronak', 'Roshan', 'Sachin', 'Sagar', 'Sahil', 'Sameer', 'Sandeep',
  'Sanjay', 'Sanjeev', 'Sarthak', 'Satish', 'Saurabh', 'Shailesh', 'Shankar', 'Sharad', 'Shashank', 'Shekhar',
  'Shivam', 'Shreyas', 'Shubham', 'Siddhant', 'Siddharth', 'Soham', 'Somesh', 'Sourabh', 'Subhash', 'Sudhir',
  'Sumit', 'Sunil', 'Suraj', 'Suresh', 'Swapnil', 'Tanmay', 'Tarun', 'Tejas', 'Trilok', 'Tushar',
  'Uday', 'Ujjwal', 'Umang', 'Utkarsh', 'Vaibhav', 'Varun', 'Ved', 'Vickey', 'Vidit', 'Vijay',
  'Vikas', 'Vikram', 'Vinay', 'Vinod', 'Vipin', 'Vipul', 'Vishal', 'Vivek', 'Yash', 'Yogesh',

  // Female names
  'Aadya', 'Aakanksha', 'Aanchal', 'Aanya', 'Aarohi', 'Aarti', 'Aditi', 'Aishwarya', 'Akanksha', 'Alka',
  'Amita', 'Amrita', 'Anamika', 'Ananya', 'Anita', 'Anjali', 'Anjana', 'Ankita', 'Anmol', 'Anshika',
  'Anushka', 'Aparna', 'Archana', 'Arpita', 'Arti', 'Ashwini', 'Avani', 'Babita', 'Barkha', 'Bharti',
  'Bhavna', 'Chaitali', 'Chanchal', 'Charu', 'Chetna', 'Damini', 'Deepa', 'Deepika', 'Deepti', 'Devika',
  'Diksha', 'Dimple', 'Dipali', 'Disha', 'Divya', 'Drishti', 'Garima', 'Gauri', 'Gayatri', 'Geeta',
  'Geetanjali', 'Gunjan', 'Hansika', 'Harsha', 'Harshita', 'Hema', 'Himanshi', 'Indu', 'Ishani', 'Ishita',
  'Jagruti', 'Jahnavi', 'Jaya', 'Jyoti', 'Kajal', 'Kalpana', 'Kalyani', 'Kamini', 'Kanika', 'Karishma',
  'Kashish', 'Kavita', 'Khushboo', 'Khushi', 'Kiran', 'Kirti', 'Komal', 'Kriti', 'Lakshmi', 'Lata',
  'Lavanya', 'Leela', 'Madhu', 'Madhuri', 'Mahima', 'Malini', 'Mamta', 'Manisha', 'Manju', 'Mansi',
  'Maya', 'Meena', 'Meenakshi', 'Meera', 'Megha', 'Minakshi', 'Mohini', 'Monika', 'Mukta', 'Naina',
  'Namrata', 'Nandini', 'Navya', 'Neelam', 'Neha', 'Nidhi', 'Nikita', 'Nirmala', 'Nisha', 'Nishita',
  'Nitya', 'Palak', 'Pallavi', 'Parul', 'Payal', 'Pooja', 'Poonam', 'Prachi', 'Pragya', 'Pratibha',
  'Prerna', 'Preeti', 'Priya', 'Priyanka', 'Rachna', 'Radha', 'Radhika', 'Ragini', 'Rakhi', 'Rashmi',
  'Raveena', 'Rekha', 'Renu', 'Renuka', 'Richa', 'Riddhi', 'Ritu', 'Rohini', 'Ruchi', 'Rupa',
  'Rupal', 'Sakshi', 'Saloni', 'Samiksha', 'Sangeeta', 'Sanjana', 'Sapna', 'Sarita', 'Saroj', 'Saumya',
  'Seema', 'Shalinee', 'Shalini', 'Shanti', 'Sheetal', 'Shikha', 'Shilpa', 'Shivani', 'Shobha', 'Shreya',
  'Shruti', 'Shweta', 'Simran', 'Sneha', 'Sonali', 'Sonam', 'Srishti', 'Sudha', 'Sujata', 'Suman',
  'Sunita', 'Sunidhi', 'Supriya', 'Surbhi', 'Sushma', 'Swati', 'Tamanna', 'Tanuja', 'Tanya', 'Tanvi',
  'Tejaswini', 'Trisha', 'Uma', 'Urmila', 'Urvashi', 'Usha', 'Vaishali', 'Vandana', 'Varsha', 'Vidya',
  'Vimala', 'Vinita', 'Yamini', 'Yashika', 'Yogita',
];

const INDIAN_MIDDLE_NAMES = [
  'Kumar', 'Chandra', 'Prasad', 'Singh', 'Lal', 'Nath', 'Kant', 'Prakash',
  'Devi', 'Rao', 'Bhai', 'Mohan', 'Dutt', 'Dayal', 'Shankar', 'Charan',
];

const INDIAN_LAST_NAMES = [
  // North & Central
  'Agarwal', 'Agrawal', 'Ahuja', 'Anand', 'Arora', 'Arya', 'Bajaj', 'Bajpai', 'Bakshi', 'Bansal',
  'Batra', 'Bedi', 'Bhasin', 'Bhatia', 'Bhatnagar', 'Bhatt', 'Chadha', 'Chaturvedi', 'Chauhan', 'Chawla',
  'Chhabra', 'Chopra', 'Choudhary', 'Choudhury', 'Dewan', 'Dhawan', 'Dhillon', 'Dixit', 'Dubey', 'Garg',
  'Gill', 'Goel', 'Goyal', 'Grewal', 'Grover', 'Gulati', 'Gupta', 'Handa', 'Hooda', 'Jain',
  'Jaiswal', 'Jha', 'Johar', 'Joshi', 'Juneja', 'Kakkar', 'Kapoor', 'Kashyap', 'Kaul', 'Kaur',
  'Kaushik', 'Khan', 'Khanna', 'Khatri', 'Kothari', 'Kumar', 'Lamba', 'Mahajan', 'Malhotra', 'Malik',
  'Mathur', 'Maurya', 'Mehra', 'Mehrotra', 'Mehta', 'Mishra', 'Mittal', 'Narang', 'Narula', 'Negi',
  'Nigam', 'Ojha', 'Paliwal', 'Pandey', 'Pandit', 'Pant', 'Parashar', 'Paswan', 'Pathak', 'Prasad',
  'Purohit', 'Rai', 'Raina', 'Rajput', 'Rana', 'Rastogi', 'Rathore', 'Rawat', 'Sabharwal', 'Sachdeva',
  'Sahani', 'Sahay', 'Saini', 'Sareen', 'Saxena', 'Sehgal', 'Sethi', 'Sharma', 'Shastri', 'Shekhawat',
  'Shukla', 'Sidhu', 'Singal', 'Singh', 'Singhal', 'Singhania', 'Sinha', 'Sodhi', 'Soni', 'Sood',
  'Srivastava', 'Talwar', 'Tandon', 'Thakur', 'Thapar', 'Tiwari', 'Tomar', 'Tripathi', 'Trivedi', 'Tyagi',
  'Upadhyay', 'Uppal', 'Varshney', 'Verma', 'Virk', 'Vohra', 'Vyas', 'Wadhwa', 'Walia', 'Yadav',

  // West & Central (Maharashtra, Gujarat, Rajasthan)
  'Apte', 'Bhosle', 'Brahmbhatt', 'Chokshi', 'Dalal', 'Dani', 'Dave', 'Deshmukh', 'Deshpande', 'Dholakia',
  'Gaikwad', 'Gandhi', 'Gokhale', 'Jadhav', 'Jani', 'Kadam', 'Kamat', 'Kulkarni', 'Lodha', 'Maheshwari',
  'Modi', 'More', 'Naik', 'Panchal', 'Pandya', 'Parekh', 'Parikh', 'Parmar', 'Patel', 'Patil',
  'Pawar', 'Phadke', 'Prajapati', 'Raval', 'Shah', 'Shinde', 'Shirke', 'Shroff', 'Solanki', 'Tambe',
  'Thakkar', 'Vaidya', 'Wadekar', 'Wagle',

  // East & Northeast (Bengal, Odisha, Assam, Bihar)
  'Adhikari', 'Banerjee', 'Barman', 'Basak', 'Basu', 'Bhaduri', 'Bhagat', 'Bhattacharya', 'Biswas', 'Bora',
  'Bose', 'Chakraborty', 'Chatterjee', 'Chowdhury', 'Das', 'Dasgupta', 'Dash', 'De', 'Dey', 'Dutta',
  'Ganguly', 'Ghosh', 'Goswami', 'Guha', 'Kalita', 'Kundu', 'Lahiri', 'Maiti', 'Majumdar', 'Mallick',
  'Mandal', 'Manna', 'Mazumdar', 'Mitra', 'Mohanty', 'Mukherjee', 'Mukhopadhyay', 'Munshi', 'Patnaik', 'Paul',
  'Poddar', 'Pradhan', 'Roy', 'Roychowdhury', 'Saha', 'Sahoo', 'Samanta', 'Sanyal', 'Sarkar', 'Sen',
  'Sengupta', 'Tarafdar',

  // South (Karnataka, Tamil Nadu, Andhra, Telangana, Kerala)
  'Balakrishnan', 'Bhat', 'Dsouza', 'Hegde', 'Iyengar', 'Iyer', 'Kamath', 'Kotian', 'Kurian', 'Madhavan',
  'Menon', 'Murthy', 'Nadkarni', 'Naidu', 'Nair', 'Nambiar', 'Nayak', 'Padmanabhan', 'Pai', 'Panicker',
  'Pillai', 'Prabhu', 'Raju', 'Ramachandran', 'Ramaswamy', 'Ranganathan', 'Rao', 'Reddy', 'Seshan', 'Shenoy',
  'Shetty', 'Srinivasan', 'Subramanian', 'Sundaram', 'Swaminathan', 'Varghese', 'Venkataraman', 'Venkatesh', 'Viswanathan', 'Warrier',
];

function getRandomIndianName(): string {
  const firstName = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
  const lastName = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];

  // ~15% chance to include a traditional middle name/title for extra entropy and realism
  if (Math.random() < 0.15) {
    const middleName = INDIAN_MIDDLE_NAMES[Math.floor(Math.random() * INDIAN_MIDDLE_NAMES.length)];
    return `${firstName} ${middleName} ${lastName}`;
  }

  return `${firstName} ${lastName}`;
}

function getRandomIndianPhoneNumber(): string {
  const prefixes = ['6', '7', '8', '9'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `${prefix}${suffix}`;
}

export async function POST(request: Request) {
  const origin = getOrigin(request);

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload) {
      return Response.json({ error: 'Missing encrypted payload' }, { status: 400 });
    }

    // Decrypt the payload (Base64)
    const decryptedString = decodeURIComponent(escape(atob(payload)));
    const data = JSON.parse(decryptedString);

    const { orderId, amount, mobileNumber, addressData } = data;

    // Prioritize user entered phone number first, fallback to mobileNumber, or generate random Indian mobile number
    const rawUserPhone = (addressData?.phone || addressData?.altPhone || '').toString().replace(/\D/g, '');
    const rawMobile = (mobileNumber || '').toString().replace(/\D/g, '');

    const phone = rawUserPhone.length >= 10
      ? rawUserPhone.slice(-10)
      : rawMobile.length >= 10
      ? rawMobile.slice(-10)
      : getRandomIndianPhoneNumber();

    const rawCustomerName = (addressData?.name || '').trim();
    const customerName = (!rawCustomerName || rawCustomerName.toLowerCase() === 'user')
      ? getRandomIndianName()
      : rawCustomerName;

    // Call Cashfree API
    const cashfreePayload = {
      order_amount: parseFloat(amount) || 1,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: "cust_" + Math.random().toString(36).substring(2, 11),
        customer_phone: phone,
        customer_name: customerName
      },
      order_meta: {
        // We will verify the payment or show success on this page
        return_url: `${origin}/payment-success?order_id={order_id}`
      }
    };

    const cashfreeResponse = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_CONFIG.clientId,
        'x-client-secret': CASHFREE_CONFIG.clientSecret,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cashfreePayload)
    });

    const cashfreeData = await cashfreeResponse.json();

    if (cashfreeResponse.ok && cashfreeData.payment_link) {
      // Return the direct payment_link which Cashfree provides to redirect the user
      return Response.json({ redirectUrl: cashfreeData.payment_link });
    } else {
      console.error('Cashfree order creation failed:', cashfreeData);
      // On failure to create order, redirect to order summary
      return Response.json({ 
        redirectUrl: `${origin}/order-summary`,
        error: cashfreeData?.message || 'Order creation failed'
      });
    }

  } catch (error) {
    console.error('Payment API error:', error);
    // On exception, redirect to order summary
    return Response.json({ 
      redirectUrl: `${origin}/order-summary`,
      error: 'Payment API error' 
    });
  }
}

