import axios from "axios";

export const callOpenAI = async (text) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                },
            });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API', error);
    }
};
