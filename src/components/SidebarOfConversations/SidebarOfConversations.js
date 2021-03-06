import React, { Component, Fragment } from 'react';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import styles from './SidebarOfConversations.module.scss';
import axios from '../../axios';
import AddChatRoomPopUpForm from './addChatRoomPopUpForm/addChatRoomPopUpForm';

let ConversationNamesAlreadyInSidebar = [];
let reactKey = 0;

/*
handles opening and closing the sidebar and showing/hiding the add chatroom pop up.
Has the logic to get the authenticated user's chatroom's and display them inside of sidebar.
*/
class SidebarOfConversations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddChatRoomPopUpShowing: false,
      listOfConversationsToOpenOrDelete: [],
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.usersChatRoomsID.length !== this.props.usersChatRoomsID.length) {
      // if chatRooms/conversations have been added or deleted resetTheSideBarDisplay
      this.resetSidebarDisplay();
      return true;
    } if (nextState !== this.state || nextProps !== this.props) {
      // normal render
      return true;
    }
    // don't re-render if nothing has changed
    return false;
  }

    /*
    causes the component to update and resets the sidebar. the reset is required so that when it compares/uses
    chatRoomsIdsArray.length and this.state.listOfConversationsToOpenOrDelete.length both start at 0. otherwise when the number of chatroom's
    changes(deleted or added) it wont display them properly.
    */
    resetSidebarDisplay = () => {
      this.setState({ listOfConversationsToOpenOrDelete: [] });
      ConversationNamesAlreadyInSidebar = [];
    }

    /* adds a single chatroom to the listOfConversationsToOpenOrDelete. This is the jsx and styles for each recipient/chatroom */
    addChatRoomToListOfConversations = (recipientsName, chatRoomsIdsArray, currentChatRoomID) => {
      const newConversation = [...this.state.listOfConversationsToOpenOrDelete];
      newConversation.push((
        <div aria-label={`options for chatroom ${recipientsName}`} role="menuitem" key={reactKey} className={styles.users}>
          <IconButton
            tabIndex="0"
            onClick={() => this.props.deleteChatRoom(currentChatRoomID)}
            onKeyDown={e => {
              if (e.key === 'Enter') { this.props.deleteChatRoom(currentChatRoomID); }
            }}
            aria-label={`Delete ${recipientsName} chatroom button`}
            size="small"
            className={styles.addChatroom}
          >
            <CloseIcon color="primary" />
          </IconButton>
          <h3
            tabIndex="0"
            onClick={() => {
              this.props.toggleSidebar(true);
              this.props.setCurrentChatRoomID(currentChatRoomID);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                this.props.toggleSidebar(true);
                this.props.setCurrentChatRoomID(currentChatRoomID);
              }
            }}
            role="button"
            aria-label={`click here to open the chatroom with ${recipientsName}`}
          >
            { recipientsName }
          </h3>
        </div>
      ));
      reactKey++;
      // prevents from  infinite loop
      if (chatRoomsIdsArray.length > this.state.listOfConversationsToOpenOrDelete.length) {
        if (!ConversationNamesAlreadyInSidebar.includes(recipientsName)) {
          ConversationNamesAlreadyInSidebar.push(recipientsName);
          this.setState({ listOfConversationsToOpenOrDelete: newConversation });
        }
      }
    };

    // showAllChatRooms gets the recipients name and calls addChatRoomToSidebar().
    getRecipientsNameForChatRooms = () => {
      if (this.props.usersChatRoomsID) {
        // All the chat rooms ids that the current authenticated user is in.
        const chatRoomIDs = { ...this.props.usersChatRoomsID };
        const chatRoomsIDsArray = Object.entries(chatRoomIDs);
        chatRoomsIDsArray.forEach(async (singleChatRoomID) => {
          try {
            const currentChatRoomID = singleChatRoomID[1];
            const chatroomData = await axios.get(`chatRoomsUsers/cru${currentChatRoomID}.json`);
            if (chatroomData.data !== null) {
              // [1][1] navigates to userID in the response. [1][1] has the auth user id and recipients id.
              const recipientAndAuthUserIdsArray = Object.entries(chatroomData.data)[1][1];
              // For each of the users in the chatroom get that recipients username
              recipientAndAuthUserIdsArray.forEach(async userID => {
                if (userID !== this.props.userID) {
                  // axios get username for the current chatRoom user
                  let recipientsName = await axios.get(`users/u${userID}/userName.json`);
                  recipientsName = recipientsName.data;
                  // takes the data and puts it into jsx for display
                  this.addChatRoomToListOfConversations(recipientsName, chatRoomsIDsArray, currentChatRoomID);
                }
              });
            }
          } catch (error) {
            return 300;
          }
        });
      }
    }

    toggleIsAddChatRoomPopUpShowing = () => {
      this.setState(prevState => ({ isAddChatRoomPopUpShowing: !prevState.isAddChatRoomPopUpShowing }));
    }

    render() {
      this.getRecipientsNameForChatRooms();
      return (
        <>
          {
                    this.state.isAddChatRoomPopUpShowing
                      ? <AddChatRoomPopUpForm toggleIsAddChatRoomPopUpShowing={this.toggleIsAddChatRoomPopUpShowing} addChatRoom={this.props.addChatRoom} />
                      : null
                }
          <aside
            className={styles.sidebarContainer}
            style={{ transform: `translateX( ${this.props.isSidebarOpen ? '0%' : '-100%'} )` }}
          >
            <IconButton
              tabIndex="0"
              onClick={() => this.setState(prevState => ({ isAddChatRoomPopUpShowing: !prevState.isAddChatRoomPopUpShowing }))}
              onKeyDown={e => {
                if (e.key === 'Enter') { this.setState(prevState => ({ isAddChatRoomPopUpShowing: !prevState.isAddChatRoomPopUpShowing })); }
              }}
              aria-label="Add a chatroom button"
              aria-haspopup="true"
              size="small"
              className={styles.addChatroom}
            >
              <AddIcon color="primary" />
            </IconButton>
            <IconButton
              tabIndex="0"
              onClick={() => this.props.toggleSidebar()}
              aria-label="Close sidebar"
              size="small"
              className={styles.mobileCloseSidebar}
            >
              <CloseIcon color="primary" />
            </IconButton>
            <div role="menu" aria-label="list of all chatroom's that you are in and can send messages in." className={styles.usersContainer}>
              { this.state.listOfConversationsToOpenOrDelete }
            </div>
          </aside>
        </>
      );
    }
}

export default SidebarOfConversations;
