import React, { Component } from 'react'
import { View, Button, TextInput } from 'react-native'

export class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: ''
        }
        this.onSignUp = this.onSignUp.bind(this)
    }

    onSignUp(){

    }

    render() {
        return(
            <View>
                <TextInput
                    placeholder='Name'
                    onChangeText={(name) => this.setState({ name })}
                />
                <TextInput
                    placeholder='Email'
                    onChangeText={(email) => this.setState({ email })}
                />
                <TextInput
                    placeholder='Password'
                    secureTextEntry = {true}
                    onChangeText={(password) => this.setState({ password })}
                />

                <Button
                    onPress={() => this.onSignUp()}
                    title='Sign Up'
                />

            </View>
        )
    }
}