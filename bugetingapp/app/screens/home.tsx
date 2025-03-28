import React from 'react'; 
import { Text, View, Image } from 'react-native';

const Home = () => {
    return (
        <View className='home'>
            <View className="header">
                <Text>
                    Welcome Shaqkori 
                </Text> {/* replace with username  */}

                <Image src='' alt='profile picture'></Image>

            </View>

            <View> </View> {/* import analysis component */}

            <View className="sumamry">
                <View className="summary-container">

                    <View className="savings">
                        savings goals 
                    </View>

                    <View className="spending">

                        <View className="income">
                            - £1,500
                        </View>

                        <View className="expense">
                            + £1,500
                        </View>

                    </View>
                
                    <View className='transaction-home'> {/* import transaction component */}

                    </View>

                </View>

                <View className="nav">
                    {/* import nav component  */}
                </View>


            </View>

        </View>
    )
}

export default Home; 