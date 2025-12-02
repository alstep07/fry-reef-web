// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DailyCheckIn
 * @notice Contract for daily check-ins with BM (Best Month) streak tracking
 * @dev Tracks daily check-ins, current month streak, and best month streak
 */
contract DailyCheckIn {
    struct UserInfo {
        uint256 lastCheckIn; // timestamp of last check-in
        uint256 totalCheckIns; // total number of check-ins
        uint256 currentMonthStreak; // current month streak
        uint256 bestMonthStreak; // best month streak ever
        uint256 currentMonthStart; // timestamp when current month streak started
        uint256 bestMonthTimestamp; // timestamp of the best month
    }

    mapping(address => UserInfo) public users;
    
    event CheckedIn(address indexed user, uint256 timestamp, uint256 currentStreak, uint256 bestStreak);

    /**
     * @notice Check in for today
     * @dev Can only check in once per day. Resets streak if new month started.
     */
    function checkIn() external {
        address user = msg.sender;
        UserInfo storage userInfo = users[user];
        
        uint256 now_ = block.timestamp;
        uint256 today = _getDayStart(now_);
        uint256 lastCheckInDay = _getDayStart(userInfo.lastCheckIn);
        
        // Check if already checked in today
        require(today > lastCheckInDay, "Already checked in today");
        
        // Get current month start
        uint256 currentMonthStart = _getMonthStart(now_);
        
        // If new month started, reset current streak
        if (userInfo.currentMonthStart < currentMonthStart) {
            // Update best streak if current is better
            if (userInfo.currentMonthStreak > userInfo.bestMonthStreak) {
                userInfo.bestMonthStreak = userInfo.currentMonthStreak;
                userInfo.bestMonthTimestamp = userInfo.currentMonthStart;
            }
            // Reset for new month
            userInfo.currentMonthStreak = 1;
            userInfo.currentMonthStart = currentMonthStart;
        } else {
            // Continue streak in same month
            userInfo.currentMonthStreak += 1;
        }
        
        // Update last check-in and total count
        userInfo.lastCheckIn = now_;
        userInfo.totalCheckIns += 1;
        
        // Update best streak if current exceeds it
        if (userInfo.currentMonthStreak > userInfo.bestMonthStreak) {
            userInfo.bestMonthStreak = userInfo.currentMonthStreak;
            userInfo.bestMonthTimestamp = userInfo.currentMonthStart;
        }
        
        emit CheckedIn(user, now_, userInfo.currentMonthStreak, userInfo.bestMonthStreak);
    }

    /**
     * @notice Get user information
     * @param user Address of the user
     * @return UserInfo struct with all user data
     */
    function getUserInfo(address user) external view returns (UserInfo memory) {
        return users[user];
    }

    /**
     * @notice Check if user has checked in today
     * @param user Address of the user
     * @return true if checked in today, false otherwise
     */
    function hasCheckedInToday(address user) external view returns (bool) {
        uint256 today = _getDayStart(block.timestamp);
        uint256 lastCheckInDay = _getDayStart(users[user].lastCheckIn);
        return today == lastCheckInDay && users[user].lastCheckIn > 0;
    }

    /**
     * @notice Get the start of the day (00:00:00 UTC) for a given timestamp
     * @param timestamp The timestamp
     * @return Start of the day timestamp
     */
    function _getDayStart(uint256 timestamp) internal pure returns (uint256) {
        // 86400 seconds in a day
        return (timestamp / 86400) * 86400;
    }

    /**
     * @notice Get the start of the month (first day, 00:00:00 UTC) for a given timestamp
     * @param timestamp The timestamp
     * @return Start of the month timestamp
     */
    function _getMonthStart(uint256 timestamp) internal pure returns (uint256) {
        // Approximate: use 30 days per month
        // For more precision, would need to use a library or calculate based on actual calendar
        uint256 daysSinceEpoch = timestamp / 86400;
        uint256 monthsSinceEpoch = daysSinceEpoch / 30;
        return monthsSinceEpoch * 30 * 86400;
    }
}

