import axios from 'axios';

let Get = async (url: string)=>{
    let resp =  await axios.get(url)
    return resp
}

export const Authorize = ({email, id, admin, staff})=>{
    return Get(`${process.env.SNAPPY_AUTH}/auth/refresh_token?id=${id}&email=${email}&admin=${admin}&staff=${staff}`)
}