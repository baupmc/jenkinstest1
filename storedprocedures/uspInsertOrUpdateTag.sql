USE [galaxy_new]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		bonic
-- Create date: 2017-05-12
-- Description:	Insert or Update Tag
-- =============================================

CREATE PROCEDURE [dbo].[uspInsertOrUpdateTag] 
(@tagId uniqueidentifier, @tagName varchar(50), @tagTypeId uniqueidentifier)

AS 

IF NOT EXISTS (SELECT * FROM [dbo].[Tag] WHERE [Id] = @tagId)

    INSERT INTO [dbo].[Tag]
	([Id],[Name],[TagTypeId])
    VALUES
	(@tagId, @tagName, @tagTypeId)

ELSE

    UPDATE [dbo].[Tag]
    SET [Name]=@tagName, [TagTypeId]=@tagTypeId
    WHERE ID = @tagId